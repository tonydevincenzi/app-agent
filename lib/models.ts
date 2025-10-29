import { createAnthropic } from '@ai-sdk/anthropic'
import { createFireworks } from '@ai-sdk/fireworks'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createVertex } from '@ai-sdk/google-vertex'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import { createOllama } from 'ollama-ai-provider'

export type LLMModel = {
  id: string
  name: string
  provider: string
  providerId: string
}

export type LLMModelConfig = {
  model?: string
  apiKey?: string
  baseURL?: string
  temperature?: number
  topP?: number
  topK?: number
  frequencyPenalty?: number
  presencePenalty?: number
  maxTokens?: number
}

export function getModelClient(model: LLMModel, config: LLMModelConfig) {
  const { id: modelNameString, providerId } = model
  const { apiKey, baseURL } = config

  // Helper to build config with conditional apiKey
  // Only includes apiKey property if we have a value, allowing SDK to check env vars
  const buildConfig = (
    envVar: string | undefined,
    defaultBaseURL?: string,
  ) => {
    const resolvedApiKey = apiKey || envVar
    return {
      ...(resolvedApiKey && { apiKey: resolvedApiKey }),
      ...(baseURL && { baseURL }),
      ...(!baseURL && defaultBaseURL && { baseURL: defaultBaseURL }),
    }
  }

  const providerConfigs = {
    anthropic: () =>
      createAnthropic(buildConfig(process.env.ANTHROPIC_API_KEY))(
        modelNameString,
      ),
    openai: () =>
      createOpenAI(buildConfig(process.env.OPENAI_API_KEY))(modelNameString),
    google: () =>
      createGoogleGenerativeAI(buildConfig(process.env.GOOGLE_AI_API_KEY))(
        modelNameString,
      ),
    mistral: () =>
      createMistral(buildConfig(process.env.MISTRAL_API_KEY))(modelNameString),
    groq: () =>
      createOpenAI(
        buildConfig(process.env.GROQ_API_KEY, 'https://api.groq.com/openai/v1'),
      )(modelNameString),
    togetherai: () =>
      createOpenAI(
        buildConfig(
          process.env.TOGETHER_API_KEY,
          'https://api.together.xyz/v1',
        ),
      )(modelNameString),
    ollama: () => createOllama({ baseURL })(modelNameString),
    fireworks: () =>
      createFireworks(
        buildConfig(
          process.env.FIREWORKS_API_KEY,
          'https://api.fireworks.ai/inference/v1',
        ),
      )(modelNameString),
    vertex: () =>
      createVertex({
        googleAuthOptions: {
          credentials: JSON.parse(
            process.env.GOOGLE_VERTEX_CREDENTIALS || '{}',
          ),
        },
      })(modelNameString),
    xai: () =>
      createOpenAI(
        buildConfig(process.env.XAI_API_KEY, 'https://api.x.ai/v1'),
      )(modelNameString),
    deepseek: () =>
      createOpenAI(
        buildConfig(process.env.DEEPSEEK_API_KEY, 'https://api.deepseek.com/v1'),
      )(modelNameString),
  }

  const createClient =
    providerConfigs[providerId as keyof typeof providerConfigs]

  if (!createClient) {
    throw new Error(`Unsupported provider: ${providerId}`)
  }

  return createClient()
}
