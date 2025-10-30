import { FragmentSchema } from './schema'
import { ExecutionResult } from './types'
import { DeepPartial } from 'ai'

export type MessageText = {
  type: 'text'
  text: string
}

export type MessageCode = {
  type: 'code'
  text: string
}

export type MessageImage = {
  type: 'image'
  image: string
}

export type MessageUrl = {
  type: 'url'
  url: string
  text?: string
}

export type Message = {
  role: 'assistant' | 'user'
  content: Array<MessageText | MessageCode | MessageImage | MessageUrl>
  object?: DeepPartial<FragmentSchema>
  result?: ExecutionResult
}

export function toAISDKMessages(messages: Message[]) {
  return messages
    .filter((message) => {
      // Filter out messages that only contain URL content (UI-only, not valid for AI SDK)
      const hasOnlyUrl = message.content.length === 1 && message.content[0].type === 'url'
      return !hasOnlyUrl
    })
    .map((message) => ({
      role: message.role,
      content: message.content
        .filter((content) => {
          // Filter out URL content from messages (convert to text if needed, or exclude)
          return content.type !== 'url'
        })
        .map((content) => {
          if (content.type === 'code') {
            return {
              type: 'text',
              text: content.text,
            }
          }

          return content
        }),
    }))
    .filter((message) => {
      // Filter out messages with empty content after filtering
      return message.content.length > 0
    })
}

export async function toMessageImage(files: File[]) {
  if (files.length === 0) {
    return []
  }

  return Promise.all(
    files.map(async (file) => {
      const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
      return `data:${file.type};base64,${base64}`
    }),
  )
}
