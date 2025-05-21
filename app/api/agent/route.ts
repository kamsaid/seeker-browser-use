import { NextResponse } from 'next/server';
import { runOpenAIBrowserTask, OpenAIBrowserAgentConfig } from '../../../agent/browser-use/openai-model'; // Adjust path if necessary

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      question,
      taskDescription,
      model,
      temperature,
      useVision,
      browserUseBaseUrl,
      openAIApiKey: bodyOpenAIKey,
      browserUseApiKey: bodyBrowserUseKey,
    } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const openAIApiKey = bodyOpenAIKey || process.env.OPENAI_API_KEY;
    const browserUseApiKey = bodyBrowserUseKey || process.env.BROWSER_USE_API_KEY;

    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured on the server.');
      return NextResponse.json({ error: 'Server configuration error: Missing OpenAI API Key' }, { status: 500 });
    }
    if (!browserUseApiKey) {
      console.error('Browser-Use API key is not configured on the server.');
      return NextResponse.json({ error: 'Server configuration error: Missing Browser-Use API Key' }, { status: 500 });
    }

    const config: OpenAIBrowserAgentConfig = {
      question,
      taskDescription,
      openAIApiKey,
      browserUseApiKey,
      model, // Pass through if provided
      temperature, // Pass through if provided
      useVision, // Pass through if provided
      browserUseBaseUrl, // Pass through if provided
    };

    const taskDetails = await runOpenAIBrowserTask(config);
    return NextResponse.json(taskDetails);

  } catch (error: any) {
    console.error('Error in agent API route:', error);
    // Check if the error has a message property, common for Error objects
    const message = error.message || 'An unexpected error occurred.';
    // Check if the error might have a status code, e.g. from a fetch response error
    const status = error.status || error.statusCode || 500;
    return NextResponse.json({ error: 'Failed to run agent task', details: message }, { status });
  }
} 