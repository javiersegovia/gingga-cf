import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, User, Bot } from 'lucide-react'
import type { Message, ToolInvocation } from 'ai'
import { cn } from '@/core/utils'
import { z } from 'zod'
import Markdown from 'react-markdown'

// import { type ToolResponseData, ToolResponseDataSchema } from '@/routes/api+/_chat-tools'

// type ToolInvocation = {
//   name: string
//   arguments: Record<string, any>
//   output: any
// }

// type Message = {
//   role: 'user' | 'assistant' | 'system' | 'tool' | 'function' | 'data'
//   content: string
//   toolInvocations?: ToolInvocation[]
// }

export const ToolResponseDataSchema = z.object({
  success: z.boolean(),
  description: z.string(),
  error: z.string().optional(),
  data: z.any().optional(),
})

export type ToolResponseData = z.infer<typeof ToolResponseDataSchema>

type ChatMessageProps = {
  message: Message
}

type BasicToolCardProps = {
  result: ToolResponseData
}

const BasicToolCard = ({ result }: BasicToolCardProps) => {
  return (
    <Card className="mt-2 bg-gray-900 border-gray-700 text-background">
      <CardHeader>
        <CardDescription className="text-gray-400">
          {result.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap bg-gray-950 text-gray-300 text-sm rounded-xl p-4 overflow-x-auto">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}

type UpdateProjectToolProps = {
  result: ToolResponseData
}

const UpdateProjectTool = ({ result }: UpdateProjectToolProps) => (
  <Card className="mt-2">
    <CardHeader>
      <CardTitle>{result.description}</CardTitle>
      <CardDescription>{result.description}</CardDescription>
    </CardHeader>
    <CardContent>
      {result.success ? (
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      ) : (
        <p className="text-red-500">{result.error}</p>
      )}
    </CardContent>
  </Card>
)

type ConfirmationToolProps = {
  result: ToolResponseData
}

const ConfirmationTool = ({ result }: ConfirmationToolProps) => {
  // TODO: Add a form to confirm the action using useFetcher
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>{result.description}</CardTitle>
        <CardDescription>{result.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{result.data?.details}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="default">Confirm</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

const ToolMessageLoading = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <div
    className={cn(
      'relative text-yellow-400/80 font-normal text-sm animate-pulse overflow-hidden rounded-lg p-2',
      className,
    )}
  >
    <p className="relative">{children}</p>
  </div>
)

const ToolsMap = {
  getProjectInfo: {
    component: BasicToolCard,
    loading: ToolMessageLoading,
    loadingMessage: 'Fetching project info...',
  },
  getModules: {
    component: BasicToolCard,
    loading: ToolMessageLoading,
    loadingMessage: 'Fetching modules...',
  },
  getFunctionalitiesByModuleId: {
    component: BasicToolCard,
    loading: ToolMessageLoading,
    loadingMessage: 'Fetching functionalities...',
  },
  updateProject: {
    component: UpdateProjectTool,
    loading: ToolMessageLoading,
    loadingMessage: 'Updating project...',
  },
  updateProjectMetadata: {
    component: BasicToolCard,
    loading: ToolMessageLoading,
    loadingMessage: 'Updating project metadata...',
  },
  requestConfirmation: {
    component: ConfirmationTool,
    loading: ToolMessageLoading,
    loadingMessage: 'Requesting confirmation...',
  },
}

const ToolMessage = ({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation
}) => {
  const isLoading =
    toolInvocation.state === 'partial-call' || toolInvocation.state === 'call'
  const tool = ToolsMap[toolInvocation.toolName as keyof typeof ToolsMap]

  if (!tool) {
    return null
  }

  const {
    component: ToolComponent,
    loading: LoadingComponent,
    loadingMessage,
  } = tool

  if (isLoading) {
    return (
      <LoadingComponent className="text-gray-300">
        {loadingMessage}
      </LoadingComponent>
    )
  }

  const toolResponse =
    'result' in toolInvocation
      ? ToolResponseDataSchema.safeParse(toolInvocation.result)
      : null
  if (!toolResponse?.success) {
    return <div>Error parsing tool response data</div>
  }

  return <ToolComponent result={toolResponse.data} />
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // const toggleExpand = () => setIsExpanded(!isExpanded)

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
                <ol className="p-4 bg-gray-900 space-y-2 mt-2 pl-10 rounded-xl list-decimal">
                  {children}
                </ol>
              ),
              ul: ({ children }) => (
                <ul className="p-4 bg-gray-900 border-gray-700 space-y-2 mt-2 rounded-xl">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li className="list-item">{children}</li>,
            }}
          >
            {message.content}
          </Markdown>
          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <Collapsible
              open={isExpanded}
              onOpenChange={setIsExpanded}
              className="py-0"
            >
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
                    <ToolMessageLoading>
                      Generating response...
                    </ToolMessageLoading>
                  ) : (
                    <span className="ml-2 text-xs text-gray-300">Details</span>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent
                className={cn(
                  'm-0 space-y-2 overflow-hidden transition-all duration-300 ease-in-out',
                  isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0',
                )}
              >
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
