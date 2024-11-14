import * as React from 'react'
import { Check, ChevronsUpDown, ExternalLinkIcon } from 'lucide-react'
import { cn } from '@/core/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { AIModel, aiModels, modelIconPaths } from './ai-models'
import { Button } from '../ui/button'
import { Link } from '@remix-run/react'

export function SelectAIModel() {
  const [open, setOpen] = React.useState(false)
  const defaultModel = aiModels.find(
    (model) => model.id === 'openai/gpt-4o-mini',
    // (model) => model.id === 'meta-llama/llama-3.2-1b-instruct',
  )!

  const [selectedModel, setSelectedModel] =
    React.useState<AIModel>(defaultModel)
  const [highlightedModel, setHighlightedModel] =
    React.useState<AIModel>(defaultModel)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const currentIndex = aiModels.findIndex(
        (model) => model.id === highlightedModel.id,
      )

      let nextIndex = currentIndex
      if (event.key === 'ArrowUp' && currentIndex > 0) {
        nextIndex = currentIndex - 1
      } else if (
        event.key === 'ArrowDown' &&
        currentIndex < aiModels.length - 1
      ) {
        nextIndex = currentIndex + 1
      }

      setHighlightedModel(aiModels[nextIndex])
    }
  }

  return (
    <div className="relative w-[300px]">
      <Popover
        open={open}
        onOpenChange={(open) => {
          if (open) {
            setHighlightedModel(defaultModel)
          }
          setOpen(open)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <img
                src={modelIconPaths[selectedModel.provider]}
                alt={selectedModel.provider}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-neutral-300 text-xs">
                {selectedModel.name}
              </span>
              {selectedModel.tag && (
                <Badge
                  variant="secondary"
                  size="xs"
                  className={cn(
                    'ml-2 font-title',
                    selectedModel.tag === 'Premium' && 'bg-pink-800',
                    selectedModel.tag === 'Enterprise' && 'bg-purple-800',
                  )}
                >
                  {selectedModel.tag}
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <div className="relative">
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command className="w-[300px]" onKeyDown={handleKeyDown}>
              <CommandInput placeholder="Search models..." />
              <CommandList>
                <CommandEmpty>No models found.</CommandEmpty>
                <CommandGroup>
                  {aiModels.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.name}
                      disabled={
                        model.tag === 'Premium' || model.tag === 'Enterprise'
                      }
                      onSelect={() => {
                        setSelectedModel(model)
                        setOpen(false)
                      }}
                      onMouseEnter={() => setHighlightedModel(model)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={modelIconPaths[model.provider]}
                          alt={model.provider}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        <span className="text-neutral-300 text-xs">
                          {model.name}
                        </span>
                        {model.tag && (
                          <Badge
                            variant="secondary"
                            size="xs"
                            className={cn(
                              'ml-2 font-title',
                              model.tag === 'Premium' && 'bg-pink-800',
                              model.tag === 'Enterprise' && 'bg-purple-800',
                            )}
                          >
                            {model.tag}
                          </Badge>
                        )}
                      </div>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedModel.id === model.id
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
          {open && (
            <div className="absolute top-0 right-[calc(100%+4px)] w-[300px] p-4 bg-popover text-popover-foreground shadow-md rounded-md border">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={modelIconPaths[highlightedModel.provider]}
                      alt={highlightedModel.provider}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <h4 className="text-sm">
                      {highlightedModel.provider} — {highlightedModel.name}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {highlightedModel.description}
                  </p>
                </div>
                <div className="divide-y divide-gray-700">
                  <div className="flex justify-between items-center py-1">
                    <div className="text-xs text-muted-foreground">Context</div>
                    <div className="text-xs">
                      {highlightedModel.contextWindow.toLocaleString()} tokens
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <div className="text-xs text-muted-foreground">
                      Input Pricing
                    </div>
                    <div className="text-xs">
                      ${highlightedModel.inputPricing} / million tokens
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <div className="text-xs text-muted-foreground">
                      Output Pricing
                    </div>
                    <div className="text-xs">
                      ${highlightedModel.outputPricing.toFixed(2)} / million
                      tokens
                    </div>
                  </div>
                  <div className="flex justify-start items-center pt-4">
                    <div className="text-xs">
                      <Link
                        to={highlightedModel.website}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1 text-xs text-blue-500"
                      >
                        More information
                        <ExternalLinkIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Popover>
    </div>
  )
}
