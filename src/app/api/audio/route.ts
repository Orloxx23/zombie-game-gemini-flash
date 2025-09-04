import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

function pcmToWav(pcmData: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16) {
  const byteRate = sampleRate * channels * bitDepth / 8;
  const blockAlign = channels * bitDepth / 8;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  let offset = 0;

  // RIFF header
  header.write('RIFF', offset); offset += 4;
  header.writeUInt32LE(fileSize, offset); offset += 4;
  header.write('WAVE', offset); offset += 4;

  // fmt chunk
  header.write('fmt ', offset); offset += 4;
  header.writeUInt32LE(16, offset); offset += 4; // chunk size
  header.writeUInt16LE(1, offset); offset += 2; // audio format (PCM)
  header.writeUInt16LE(channels, offset); offset += 2;
  header.writeUInt32LE(sampleRate, offset); offset += 4;
  header.writeUInt32LE(byteRate, offset); offset += 4;
  header.writeUInt16LE(blockAlign, offset); offset += 2;
  header.writeUInt16LE(bitDepth, offset); offset += 2;

  // data chunk
  header.write('data', offset); offset += 4;
  header.writeUInt32LE(dataSize, offset);

  return Buffer.concat([header, pcmData]);
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read aloud in a terrifying and sinister tone, but read quickly without losing the narrative style: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Enceladus' },
          },
        },
      },
    });

    console.log('Gemini response:', JSON.stringify(response, null, 2));
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      console.log('No audio data found in response');
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 });
    }

    const pcmBuffer = Buffer.from(audioData, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer);
    
    return new NextResponse(wavBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': wavBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}