import { useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import { Form, useLocation, useParams } from '@remix-run/react'
import { useChat } from 'ai/react'
import { ChatMessage } from './chat-message'
import { Loader2, Send } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { SelectAIModel } from '../ai/select-ai-model'

export function Chat() {
  const { toast } = useToast()
  const { projectId } = useParams()
  const { pathname } = useLocation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: '/api/chat',
    streamProtocol: 'data',
    body: { projectId },
    onResponse() {
      scrollToBottom()
    },
    onFinish() {},
    onError(error) {
      toast({
        title: 'Error',
        description:
          typeof error.message === 'object'
            ? JSON.parse(error.message)
            : error.message,
        toastType: 'error',
        duration: 5000,
      })
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMessages([])
  }, [pathname, setMessages])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-transparent text-white overflow-hidden">
      <div className="bg-gray-900 p-2 w-full h-12 flex flex-col justify-center items-end">
        <SelectAIModel />
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} className="mt-auto" />
      </div>

      <Form
        onSubmit={handleSubmit}
        method="POST"
        className="mt-auto bg-gray-900 flex flex-col p-2 border-t border-gray-800 h-32"
      >
        <div className="flex-1 flex items-start rounded-xl bg-gray-950 gap-0 border border-gray-800 focus-within:ring-1 focus-within:ring-yellow-400/40 focus-within:ring-offset-gray-900">
          <Textarea
            name="message"
            autoComplete="off"
            rows={2}
            placeholder="Talk with the AI about your project..."
            className="flex-1 resize-none border-none text-gray-100 h-full rounded-xl text-base bg-transparent px-4 py-4 focus-visible:ring-0 focus:outline-none"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gray-950 text-gray-400 mt-4 mr-4 h-12 w-12 rounded-xl border-gray-800 border font-bold flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </Form>
    </div>
  )
}
