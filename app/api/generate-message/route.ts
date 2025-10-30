import { handleAPIError } from '@/lib/api-errors'
import { getModelClient, LLMModel, LLMModelConfig } from '@/lib/models'
import { generateText, LanguageModel, CoreMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    userMessage,
    model,
    config,
  }: {
    userMessage: string
    model: LLMModel
    config: LLMModelConfig
  } = await req.json()

  const { model: modelNameString, apiKey: modelApiKey, ...modelParams } = config
  const modelClient = getModelClient(model, config)

  try {
    const { text } = await generateText({
      model: modelClient as LanguageModel,
      system: 'You are a helpful assistant. Generate a brief, friendly message (1-2 sentences) about what you\'re building based on the user\'s request. Be enthusiastic and specific. Don\'t mention code details, just what the app will do.',
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ] as CoreMessage[],
      maxTokens: 100,
      ...modelParams,
    })

    return Response.json({ message: text })
  } catch (error: any) {
    return handleAPIError(error, { hasOwnApiKey: !!config.apiKey })
  }
}

