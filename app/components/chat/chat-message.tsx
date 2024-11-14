import { PropsWithChildren, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, User, Bot } from 'lucide-react'
import type { Message, ToolInvocation } from 'ai'
import { cn } from '@/core/utils'
import Markdown from 'react-markdown'
import {
  CustomToolResponse,
  CustomToolResponseSchema,
} from '@/schemas/tools-schema'

interface ToolCardProps {
  data: CustomToolResponse
}

const ToolCard = ({ data }: ToolCardProps) => {
  const { result, error } = data

  return (
    <Card className="mt-2 bg-gray-900 border-gray-700">
      <CardHeader>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardHeader>

      {result && (
        <CardContent>
          <pre className="whitespace-pre-wrap bg-gray-950 text-gray-300 text-sm rounded-xl p-4 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  )
}

const ToolMessageLoading = ({ children }: PropsWithChildren) => (
  <div className="text-yellow-400/80 font-normal text-sm animate-pulse p-2">
    {children}
  </div>
)

const ToolMessage = ({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation
}) => {
  const isLoading =
    toolInvocation.state === 'partial-call' || toolInvocation.state === 'call'

  console.log('toolInvocation')
  console.log(toolInvocation)

  if (isLoading) {
    return (
      <ToolMessageLoading>
        Processing {toolInvocation.toolName}...
      </ToolMessageLoading>
    )
  }

  const toolResponse =
    'result' in toolInvocation
      ? CustomToolResponseSchema.safeParse(toolInvocation.result)
      : null

  if (!toolResponse?.success) {
    return <div>Error processing tool response</div>
  }

  return <ToolCard data={toolResponse.data} />
}

export function ChatMessage({ message }: { message: Message }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLoading = message.toolInvocations?.some(
    (invocation) =>
      invocation.state === 'partial-call' || invocation.state === 'call',
  )

  return (
    <div
      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`flex ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'} items-start max-w-3xl`}
      >
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback
            className={cn(
              message.role === 'assistant' ? 'bg-yellow-500' : 'bg-gray-800',
              'text-gray-100',
            )}
          >
            {message.role === 'assistant' ? (
              <Bot size={20} className="text-black" />
            ) : (
              <User size={16} />
            )}
          </AvatarFallback>
        </Avatar>

        <div
          className={`mx-2 ${message.role === 'assistant' ? 'bg-transparent text-gray-200 p-1' : 'bg-gray-700 text-gray-100 p-3'} rounded-xl`}
        >
          <Markdown
            className="space-y-4 p-0 text-sm"
            components={{
              ol: ({ children }) => (
                <ol className="list-decimal space-y-4 pl-4">{children}</ol>
              ),
            }}
          >
            {message.content}
          </Markdown>

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 mt-2 hover:bg-transparent hover:text-white"
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {isLoading ? (
                    <span className="ml-2 text-xs">Processing...</span>
                  ) : (
                    <span className="ml-2 text-xs text-gray-300">Details</span>
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {message.toolInvocations.map((toolInvocation) => (
                  <ToolMessage
                    key={toolInvocation.toolName}
                    toolInvocation={toolInvocation}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  )
}
