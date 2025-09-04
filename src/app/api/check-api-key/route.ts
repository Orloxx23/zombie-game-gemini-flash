import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  return NextResponse.json({ hasApiKey: !!apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Aquí podrías validar la API key haciendo una llamada de prueba
    // Por simplicidad, solo verificamos que no esté vacía
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}