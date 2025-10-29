import { Message } from '@/lib/messages'
import { ExternalLink, LoaderIcon } from 'lucide-react'
import { useEffect } from 'react'

export function Chat({
  messages,
  isLoading,
  onViewCode,
  hasFragment,
}: {
  messages: Message[]
  isLoading: boolean
  onViewCode?: () => void
  hasFragment?: boolean
}) {
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [JSON.stringify(messages)])

  return (
    <div
      id="chat-container"
      className="flex flex-col pb-4 gap-2"
    >
      {messages.map((message: Message, index: number) => {
        // Check if this is a URL-only message
        const isUrlOnlyMessage = message.content.length === 1 && message.content[0].type === 'url'
        
        if (isUrlOnlyMessage) {
          const urlContent = message.content[0]
          if (urlContent.type === 'url') {
            return (
              <div
                key={index}
                className="flex flex-col w-full"
              >
                <a
                  href={urlContent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-2 border-blue-500/30 dark:border-blue-500/40 rounded-2xl hover:border-blue-500/50 dark:hover:border-blue-500/60 transition-all group shadow-sm"
                >
                  <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="flex-1 font-mono text-sm text-blue-700 dark:text-blue-300 break-all">
                    {urlContent.url}
                  </span>
                </a>
              </div>
            )
          }
        }
        
        return (
          <div
            className={`flex flex-col px-4 shadow-sm whitespace-pre-wrap ${message.role !== 'user' ? 'bg-accent dark:bg-white/5 border text-accent-foreground dark:text-muted-foreground py-4 rounded-2xl gap-4 w-full' : 'bg-gradient-to-b from-black/5 to-black/10 dark:from-black/30 dark:to-black/50 py-2 rounded-xl gap-2 w-fit'} font-serif`}
            key={index}
          >
            {message.content.map((content, id) => {
              if (content.type === 'text') {
                return <div key={id}>{content.text}</div>
              }
              if (content.type === 'image') {
                return (
                  <img
                    key={id}
                    src={content.image}
                    alt="fragment"
                    className="mr-2 inline-block w-12 h-12 object-cover rounded-lg bg-white mb-2"
                  />
                )
              }
            })}
          </div>
        )
      })}
      {isLoading && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <LoaderIcon strokeWidth={2} className="animate-spin w-4 h-4" />
          {hasFragment && onViewCode ? (
            <button
              onClick={onViewCode}
              className="hover:text-foreground transition-colors cursor-pointer underline underline-offset-2"
            >
              Generating...
            </button>
          ) : (
            <span>Generating...</span>
          )}
        </div>
      )}
    </div>
  )
}
