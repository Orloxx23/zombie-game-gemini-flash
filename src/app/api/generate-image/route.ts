import { readFile } from "node:fs/promises";
import path from "node:path";

import { type NextRequest, NextResponse } from "next/server";

import { GAME_PROMPTS } from "@/lib/prompts";
import { GAME_CONFIG } from "@/lib/consts";
import { GenerateImageRequest } from "@/lib/types";

const COMFY_BASE_URL = "https://cloud.comfy.org";
const COMFY_API_KEY = process.env.COMFY_CLOUD_API_KEY;

const WORKFLOW_PATH =
  process.env.COMFY_WORKFLOW_PATH ?? "./workflows/qwen-base.json";
const PROMPT_NODE_ID = process.env.COMFY_PROMPT_NODE_ID ?? "11";
const PROMPT_INPUT_KEY = process.env.COMFY_PROMPT_INPUT_KEY ?? "prompt";
const SEED_NODE_ID = process.env.COMFY_SEED_NODE_ID ?? "6";

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 300_000;

type WorkflowNode = {
  class_type: string;
  inputs: Record<string, unknown>;
};

type Workflow = Record<string, WorkflowNode>;

type OutputFile = {
  filename: string;
  subfolder?: string;
  type?: string;
};

type JobOutputs = Record<string, { images?: OutputFile[] }>;

function comfyHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    "X-API-Key": COMFY_API_KEY as string,
    ...extra,
  };
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastError = err;
      const isDnsError =
        err instanceof TypeError &&
        String((err as { cause?: { code?: string } })?.cause?.code ?? "").match(
          /ENOTFOUND|EAI_AGAIN|ECONNRESET|ETIMEDOUT/
        );
      if (!isDnsError || attempt === retries) throw err;
      const backoff = 500 * attempt;
      console.log(
        `[comfy] network error on attempt ${attempt}, retrying in ${backoff}ms...`
      );
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastError;
}

async function loadWorkflow(prompt: string): Promise<Workflow> {
  const absolutePath = path.isAbsolute(WORKFLOW_PATH)
    ? WORKFLOW_PATH
    : path.join(process.cwd(), WORKFLOW_PATH);

  const raw = await readFile(absolutePath, "utf-8");
  const workflow = JSON.parse(raw) as Workflow;

  const promptNode = workflow[PROMPT_NODE_ID];
  if (!promptNode) {
    throw new Error(
      `Prompt node ${PROMPT_NODE_ID} not found in workflow at ${absolutePath}`
    );
  }
  promptNode.inputs = {
    ...promptNode.inputs,
    [PROMPT_INPUT_KEY]: prompt,
  };

  const seedNode = workflow[SEED_NODE_ID];
  if (seedNode && "seed" in seedNode.inputs) {
    seedNode.inputs.seed = Math.floor(Math.random() * 2 ** 32);
  }

  return workflow;
}

async function submitPrompt(workflow: Workflow): Promise<string> {
  const response = await fetchWithRetry(`${COMFY_BASE_URL}/api/prompt`, {
    method: "POST",
    headers: comfyHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prompt: workflow }),
  });

  if (!response.ok) {
    throw new Error(
      `Comfy prompt submission failed (${response.status}): ${await response.text()}`
    );
  }

  const { prompt_id } = (await response.json()) as { prompt_id: string };

  if (!prompt_id) {
    throw new Error("Comfy did not return a prompt_id");
  }

  return prompt_id;
}

async function pollUntilComplete(promptId: string): Promise<void> {
  const startedAt = Date.now();
  let pollNumber = 0;

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    pollNumber += 1;
    const response = await fetchWithRetry(
      `${COMFY_BASE_URL}/api/job/${promptId}/status`,
      { headers: comfyHeaders() }
    );

    if (!response.ok) {
      throw new Error(
        `Comfy status check failed (${response.status}): ${await response.text()}`
      );
    }

    const body = (await response.json()) as Record<string, unknown>;
    const status = String(body.status ?? "").toLowerCase();
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    console.log(
      `[comfy] poll #${pollNumber} (${elapsed}s) → ${JSON.stringify(body)}`
    );

    if (
      status === "completed" ||
      status === "success" ||
      status === "complete"
    )
      return;
    if (status === "failed" || status === "cancelled" || status === "error") {
      throw new Error(`Comfy job ended with status: ${status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Comfy job timed out");
}

async function getJobOutputs(promptId: string): Promise<JobOutputs> {
  const response = await fetchWithRetry(
    `${COMFY_BASE_URL}/api/jobs/${promptId}`,
    { headers: comfyHeaders() }
  );

  if (!response.ok) {
    throw new Error(
      `Comfy job detail failed (${response.status}): ${await response.text()}`
    );
  }

  const job = (await response.json()) as { outputs?: JobOutputs };

  if (!job.outputs) {
    throw new Error("Comfy job has no outputs");
  }

  return job.outputs;
}

function firstImage(outputs: JobOutputs): OutputFile {
  for (const node of Object.values(outputs)) {
    const image = node.images?.[0];
    if (image) return image;
  }
  throw new Error("Comfy job returned no image output");
}

async function downloadImage(
  file: OutputFile
): Promise<{ base64Data: string; mediaType: string }> {
  const params = new URLSearchParams({
    filename: file.filename,
    subfolder: file.subfolder ?? "",
    type: file.type ?? "output",
  });

  const redirectResponse = await fetchWithRetry(
    `${COMFY_BASE_URL}/api/view?${params}`,
    {
      headers: comfyHeaders(),
      redirect: "manual",
    }
  );

  if (redirectResponse.status !== 302) {
    throw new Error(
      `Expected 302 from /api/view, got ${redirectResponse.status}`
    );
  }

  const signedUrl = redirectResponse.headers.get("location");
  if (!signedUrl) {
    throw new Error("Comfy /api/view did not return a Location header");
  }

  const fileResponse = await fetch(signedUrl);
  if (!fileResponse.ok) {
    throw new Error(
      `Failed to download from signed URL (${fileResponse.status})`
    );
  }

  const mediaType = fileResponse.headers.get("content-type") ?? "image/png";
  const buffer = Buffer.from(await fileResponse.arrayBuffer());

  return {
    base64Data: buffer.toString("base64"),
    mediaType,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!COMFY_API_KEY) {
      throw new Error("Missing COMFY_CLOUD_API_KEY environment variable");
    }

    const { imagePrompt }: GenerateImageRequest = await request.json();

    const prompt = GAME_PROMPTS.GENERATE_IMAGE(
      imagePrompt || GAME_CONFIG.IMAGE.DEFAULT_PROMPT
    );

    const workflow = await loadWorkflow(prompt);
    console.log(`[comfy] workflow loaded (${WORKFLOW_PATH}), submitting...`);

    const promptId = await submitPrompt(workflow);
    console.log(`[comfy] submitted: ${promptId}, polling...`);

    await pollUntilComplete(promptId);
    console.log(`[comfy] completed: ${promptId}, fetching outputs...`);

    const outputs = await getJobOutputs(promptId);
    const target = firstImage(outputs);
    console.log(`[comfy] downloading: ${target.filename}`);

    const image = await downloadImage(target);
    console.log(
      `[comfy] downloaded ${image.base64Data.length} bytes (base64), mediaType=${image.mediaType}`
    );

    return NextResponse.json({ image });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Error generating image" },
      { status: 500 }
    );
  }
}
