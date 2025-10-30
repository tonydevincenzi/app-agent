'use client'

import { Chat } from '@/components/chat'
import { ChatInput } from '@/components/chat-input'
import { Preview } from '@/components/preview'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Message, toAISDKMessages, toMessageImage } from '@/lib/messages'
import { LLMModelConfig } from '@/lib/models'
import modelsList from '@/lib/models.json'
import { FragmentSchema, fragmentSchema as schema } from '@/lib/schema'
import templates from '@/lib/templates'
import { ExecutionResult } from '@/lib/types'
import { DeepPartial } from 'ai'
import { experimental_useObject as useObject } from 'ai/react'
import { usePostHog } from 'posthog-js/react'
import { SetStateAction, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export default function Home() {
  const [chatInput, setChatInput] = useLocalStorage('chat', '')
  const [files, setFiles] = useState<File[]>([])
  const [selectedTemplate] = useState<string>('auto')
  const [languageModel, setLanguageModel] = useLocalStorage<LLMModelConfig>(
    'languageModel',
    {
      model: 'claude-haiku-4-5-20251001',
    },
  )

  const posthog = usePostHog()

  const [result, setResult] = useState<ExecutionResult>()
  const [messages, setMessages] = useState<Message[]>([])
  const [fragment, setFragment] = useState<DeepPartial<FragmentSchema>>()
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [useMorphApply] = useLocalStorage(
    'useMorphApply',
    process.env.NEXT_PUBLIC_USE_MORPH_APPLY === 'true',
  )
  const [showCodeView, setShowCodeView] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'code' | 'fragment'>('code')
  const generatedMessageRef = useRef<string | null>(null)
  const hasGeneratedMessageRef = useRef(false)
  const buildingMessageIndexRef = useRef<number | null>(null)

  const filteredModels = modelsList.models.filter((model) => {
    // Only show GPT 5 series, Sonnet 4.5 series, and Haiku 4.5
    const isGPT5 = model.id.startsWith('gpt-5')
    const isSonnet45 = model.id.includes('sonnet-4-5')
    const isHaiku45 = model.id.includes('haiku-4-5')
    
    if (!isGPT5 && !isSonnet45 && !isHaiku45) {
      return false
    }
    
    if (process.env.NEXT_PUBLIC_HIDE_LOCAL_MODELS) {
      return model.providerId !== 'ollama'
    }
    return true
  })

  const currentModel = filteredModels.find(
    (model) => model.id === languageModel.model,
  )
  const currentTemplate =
    selectedTemplate === 'auto'
      ? templates
      : { [selectedTemplate]: templates[selectedTemplate] }
  const lastMessage = messages[messages.length - 1]

  // Determine which API to use based on morph toggle and existing fragment
  const shouldUseMorph =
    useMorphApply && fragment && fragment.code && fragment.file_path
  const apiEndpoint = shouldUseMorph ? '/api/morph-chat' : '/api/chat'

  const { object, submit, isLoading, stop, error } = useObject({
    api: apiEndpoint,
    schema,
    onError: (error) => {
      console.error('Error submitting request:', error)
      if (error.message.includes('limit')) {
        setIsRateLimited(true)
      }

      setErrorMessage(error.message)
    },
    onFinish: async ({ object: fragment, error }) => {
      if (!error) {
        // send it to /api/sandbox
        console.log('fragment', fragment)
        setIsPreviewLoading(true)
        posthog.capture('fragment_generated', {
          template: fragment?.template,
        })

        const response = await fetch('/api/sandbox', {
          method: 'POST',
          body: JSON.stringify({
            fragment,
            userID: undefined,
            teamID: undefined,
            accessToken: undefined,
          }),
        })

        const result = await response.json()
        console.log('result', result)
        posthog.capture('sandbox_created', { url: result.url })

        setResult(result)
        
        // Add URL as a separate message with only the URL
        if (result.url) {
          addMessage({
            role: 'assistant',
            content: [
              {
                type: 'url',
                url: result.url,
              }
            ],
            result
          })
        }
        setIsPreviewLoading(false)
      }
    },
  })

  useEffect(() => {
    if (object) {
      setFragment(object)
      
      // Generate LLM message when building starts (only once per build session)
      if (!hasGeneratedMessageRef.current) {
        // Get the last user message to use as context
        const lastUserMessage = messages
          .slice()
          .reverse()
          .find((msg) => msg.role === 'user')
        
        // Extract text from user message (prioritize text, fallback to code)
        let userMessageText = ''
        if (lastUserMessage) {
          const textContent = lastUserMessage.content.find((c) => c.type === 'text')
          const codeContent = lastUserMessage.content.find((c) => c.type === 'code')
          userMessageText = (textContent as { text: string })?.text || (codeContent as { text: string })?.text || ''
        }

        // Set initial message and track its index
        const initialContent: Message['content'] = [
          { type: 'text', text: 'Building your app...' },
        ]
        
        setMessages((previousMessages) => {
          const lastMsg = previousMessages[previousMessages.length - 1]
          if (!lastMsg || lastMsg.role !== 'assistant') {
            buildingMessageIndexRef.current = previousMessages.length
            return [...previousMessages, { role: 'assistant' as const, content: initialContent }]
          } else {
            buildingMessageIndexRef.current = previousMessages.length - 1
            const updated = [...previousMessages]
            updated[updated.length - 1] = {
              ...lastMsg,
              content: initialContent,
            }
            return updated
          }
        })

        // Generate LLM message if we have a user message and model
        if (userMessageText && currentModel) {
          hasGeneratedMessageRef.current = true
          generatedMessageRef.current = 'generating'
          
          console.log('Generating message for:', userMessageText)
          
          fetch('/api/generate-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userMessage: userMessageText,
              model: currentModel,
              config: languageModel,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error(`API error: ${res.status}`)
              }
              return res.json()
            })
            .then((data) => {
              console.log('Generated message response:', data)
              if (data.message) {
                generatedMessageRef.current = data.message
                const generatedContent: Message['content'] = [
                  { type: 'text', text: data.message },
                ]
                
                // Update the message at the tracked index
                setMessages((previousMessages) => {
                  const updated = [...previousMessages]
                  // Try the tracked index first
                  if (buildingMessageIndexRef.current !== null && updated[buildingMessageIndexRef.current]) {
                    const msg = updated[buildingMessageIndexRef.current]
                    if (msg.role === 'assistant') {
                      console.log('Updating message at tracked index:', buildingMessageIndexRef.current)
                      updated[buildingMessageIndexRef.current] = {
                        ...msg,
                        content: generatedContent,
                      }
                      return updated
                    }
                  }
                  
                  // Fallback: find by content
                  const buildingMsgIndex = updated.findIndex(
                    (msg) =>
                      msg.role === 'assistant' &&
                      msg.content.some(
                        (c) => c.type === 'text' && c.text === 'Building your app...'
                      )
                  )
                  
                  if (buildingMsgIndex !== -1) {
                    console.log('Updating message at found index:', buildingMsgIndex)
                    updated[buildingMsgIndex] = {
                      ...updated[buildingMsgIndex],
                      content: generatedContent,
                    }
                  } else {
                    // Fallback: update the last assistant message
                    const lastMsg = updated[updated.length - 1]
                    if (lastMsg && lastMsg.role === 'assistant') {
                      console.log('Updating last assistant message')
                      updated[updated.length - 1] = {
                        ...lastMsg,
                        content: generatedContent,
                      }
                    } else {
                      console.warn('Could not find assistant message to update')
                    }
                  }
                  return updated
                })
              } else {
                console.warn('No message in response:', data)
                generatedMessageRef.current = null
              }
            })
            .catch((err) => {
              console.error('Failed to generate message:', err)
              generatedMessageRef.current = null
              hasGeneratedMessageRef.current = false
            })
        } else {
          console.log('Skipping message generation:', { userMessageText, currentModel })
        }
      }
    } else {
      // Reset when object is cleared (new build session)
      generatedMessageRef.current = null
      hasGeneratedMessageRef.current = false
      buildingMessageIndexRef.current = null
    }
  }, [object, messages, currentModel, languageModel])

  useEffect(() => {
    if (error) stop()
  }, [error, stop])

  function setMessage(message: Partial<Message>, index?: number) {
    setMessages((previousMessages) => {
      const updatedMessages = [...previousMessages]
      updatedMessages[index ?? previousMessages.length - 1] = {
        ...previousMessages[index ?? previousMessages.length - 1],
        ...message,
      }

      return updatedMessages
    })
  }

  async function handleSubmitAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isLoading) {
      stop()
    }

    const content: Message['content'] = [{ type: 'text', text: chatInput }]
    const images = await toMessageImage(files)

    if (images.length > 0) {
      images.forEach((image) => {
        content.push({ type: 'image', image })
      })
    }

    const updatedMessages = addMessage({
      role: 'user',
      content,
    })

    submit({
      userID: undefined,
      teamID: undefined,
      messages: toAISDKMessages(updatedMessages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
      ...(shouldUseMorph && fragment ? { currentFragment: fragment } : {}),
    })

    setChatInput('')
    setFiles([])

    posthog.capture('chat_submit', {
      template: selectedTemplate,
      model: languageModel.model,
    })
  }

  function retry() {
    submit({
      userID: undefined,
      teamID: undefined,
      messages: toAISDKMessages(messages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
      ...(shouldUseMorph && fragment ? { currentFragment: fragment } : {}),
    })
  }

  function addMessage(message: Message) {
    setMessages((previousMessages) => [...previousMessages, message])
    return [...messages, message]
  }

  function handleSaveInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatInput(e.target.value)
  }

  function handleFileChange(change: SetStateAction<File[]>) {
    setFiles(change)
  }

  function handleUndo() {
    setMessages((previousMessages) => [...previousMessages.slice(0, -2)])
    setFragment(undefined)
    setResult(undefined)
    setShowCodeView(false)
  }

  const hasMessages = messages.length > 0

  return (
    <main className="flex min-h-screen h-screen">
      <div className="flex flex-col w-full h-full items-center justify-center px-4">
        <div className="flex flex-col w-full max-w-[500px] max-h-full">
          {hasMessages && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Chat
                messages={messages}
                isLoading={isLoading}
                onViewCode={() => setShowCodeView(true)}
                hasFragment={!!fragment && (!!fragment.code || isLoading)}
              />
            </div>
          )}
          <ChatInput
            retry={retry}
            isErrored={error !== undefined}
            errorMessage={errorMessage}
            isLoading={isLoading}
            isRateLimited={isRateLimited}
            stop={stop}
            input={chatInput}
            handleInputChange={handleSaveInputChange}
            handleSubmit={handleSubmitAuth}
            isMultiModal={currentModel?.multiModal || false}
            files={files}
            handleFileChange={handleFileChange}
            centered={false}
            onUndo={handleUndo}
            canUndo={messages.length > 1 && !isLoading}
            showCodeView={showCodeView}
            onToggleCodeView={() => setShowCodeView(!showCodeView)}
            hasFragment={!!fragment && (!!fragment.code || isLoading)}
            models={filteredModels}
            languageModel={languageModel}
            onLanguageModelChange={setLanguageModel}
          >
          </ChatInput>
        </div>
      </div>
      {showCodeView && (fragment || isLoading) && (
        <div className="fixed right-0 top-0 h-full w-full md:w-[600px] z-50">
          <Preview
            selectedTab={selectedTab}
            onSelectedTabChange={setSelectedTab}
            isChatLoading={isLoading}
            isPreviewLoading={isPreviewLoading}
            fragment={fragment}
            result={result}
            onClose={() => setShowCodeView(false)}
          />
        </div>
      )}
      <div className="fixed bottom-4 left-4 z-50">
        <ThemeToggle />
      </div>
    </main>
  )
}
