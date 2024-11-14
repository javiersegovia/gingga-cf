export interface AIModel {
  id: string // The unique identifier of the model inside OpenRouter.
  name: string
  provider: 'Anthropic' | 'Google' | 'Meta' | 'Mistral' | 'OpenAI' | 'xAI'
  description: string // A short description of the model.
  contextWindow: number // The maximum number of tokens the model can process in a single request.
  inputPricing: number // The cost per 1M tokens in USD.
  outputPricing: number // The cost per 1M tokens in USD.
  website: string // The website of the model.
  tag?: 'Premium' | 'Enterprise'
}

export const modelIconPaths: Record<AIModel['provider'], string> = {
  Anthropic: '/assets/img/ai-logos/anthropic.svg',
  Google: '/assets/img/ai-logos/google.svg',
  Meta: '/assets/img/ai-logos/meta.svg',
  Mistral: '/assets/img/ai-logos/mistral.svg',
  OpenAI: '/assets/img/ai-logos/openai.svg',
  xAI: '/assets/img/ai-logos/xai.svg',
}

const anthropicModels: AIModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200_000,
    inputPricing: 3,
    outputPricing: 15,
    description:
      'Claude 3.5 Sonnet balances intelligence and speed, making it ideal for enterprise workloads. It excels at complex reasoning, analysis, and creative tasks while maintaining cost efficiency. The model demonstrates strong performance across coding, math, and general knowledge domains.',
    website: 'https://www.anthropic.com/claude/sonnet',
    tag: 'Premium',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    contextWindow: 200_000,
    inputPricing: 1,
    outputPricing: 5,
    description:
      'Claude 3.5 Haiku prioritizes speed and efficiency while maintaining high accuracy. It excels at quick analysis, content generation, and real-time interactions. The model performs particularly well in scenarios requiring rapid responses without compromising quality.',
    website: 'https://www.anthropic.com/claude/haiku',
  },
]

const googleModels: AIModel[] = [
  {
    id: 'google/gemini-flash-1.5-8b',
    name: 'Gemini 1.5 Flash-8B',
    provider: 'Google',
    contextWindow: 1_000_000,
    inputPricing: 0.0375,
    outputPricing: 0.15,
    description:
      'Gemini 1.5 Flash-8B is a lightweight multimodal model optimized for speed and efficiency. It handles text, images, and code with a focus on rapid processing and cost-effectiveness, making it suitable for high-volume applications.',
    website: 'https://deepmind.google/technologies/gemini/flash/',
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    contextWindow: 1_000_000,
    inputPricing: 0.075,
    outputPricing: 0.3,
    description:
      'Gemini 1.5 Flash excels at multimodal tasks including visual understanding, classification, and content creation from images, audio, and video. It specializes in processing visual and text inputs like photographs, documents, and infographics, making it ideal for high-volume applications where speed and cost efficiency are crucial.',
    website: 'https://deepmind.google/technologies/gemini/flash/',
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    contextWindow: 2_000_000,
    inputPricing: 1.25,
    outputPricing: 5,
    description:
      'Gemini 1.5 Pro specializes in processing extensive content with its 2-million token context window. It demonstrates exceptional accuracy in long-context retrieval tasks across modalities, enabling precise handling of large documents, extensive code bases, and lengthy audio/video content.',
    website: 'https://deepmind.google/technologies/gemini/pro/',
  },
]

const mistralModels: AIModel[] = [
  {
    id: 'mistralai/mistral-nemo',
    name: 'Mistral Nemo',
    provider: 'Mistral',
    contextWindow: 128_000,
    inputPricing: 0.15,
    outputPricing: 0.15,
    description:
      'Mistral Nemo is a 12B parameter multilingual model supporting 11 major languages including English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi. It excels at cross-lingual tasks and maintains consistent performance across supported languages.',
    website: 'https://mistral.ai/news/mistral-nemo/',
  },
]

const metaModels: AIModel[] = [
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    provider: 'Meta',
    contextWindow: 100_000,
    inputPricing: 0.4,
    outputPricing: 0.4,
    description:
      'Llama 3.1 70B Instruct is optimized for high-quality dialogue and complex reasoning tasks. It demonstrates exceptional performance in human evaluations and excels at natural language understanding, generation, and complex problem-solving.',
    website:
      'https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md',
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    provider: 'Meta',
    contextWindow: 100_000,
    inputPricing: 0.055,
    outputPricing: 0.055,
    description:
      'Llama 3.1 8B Instruct combines speed and efficiency with strong performance. It excels at rapid task completion while maintaining accuracy, making it ideal for applications requiring quick responses and resource efficiency.',
    website:
      'https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md',
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct',
    name: 'Llama 3.2 3B Instruct',
    provider: 'Meta',
    contextWindow: 131_000,
    inputPricing: 0.01,
    outputPricing: 0.02,
    description:
      'Llama 3.2 3B Instruct is a multilingual model optimized for dialogue generation, reasoning, and summarization. Supporting eight languages, it excels at natural language processing tasks while maintaining efficiency in resource-constrained environments.',
    website:
      'https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md',
  },
  {
    id: 'meta-llama/llama-3.2-1b-instruct',
    name: 'Llama 3.2 1B Instruct',
    provider: 'Meta',
    contextWindow: 131_000,
    inputPricing: 0.01,
    outputPricing: 0.02,
    description:
      'Llama 3.2 1B Instruct specializes in efficient natural language processing, particularly excelling at summarization, dialogue, and multilingual text analysis. Its compact architecture makes it ideal for deployment in environments with limited computational resources.',
    website:
      'https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md',
  },
]

const openAiModels: AIModel[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    contextWindow: 128_000,
    inputPricing: 0.15,
    outputPricing: 0.6,
    description:
      'GPT-4o mini combines multimodal capabilities with cost efficiency. It processes both text and image inputs while maintaining strong performance across general tasks, making it particularly suitable for applications requiring balanced performance and resource usage.',
    website:
      'https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128_000,
    inputPricing: 2.5,
    outputPricing: 10,
    description:
      'GPT-4o excels at processing both text and image inputs with high accuracy. It demonstrates particular strength in non-English language processing and advanced visual understanding tasks, making it versatile for complex multimodal applications.',
    website: 'https://openai.com/index/hello-gpt-4o/',
    tag: 'Premium',
  },
  {
    id: 'openai/o1-mini',
    name: 'O1 Mini',
    provider: 'OpenAI',
    contextWindow: 128_000,
    inputPricing: 3,
    outputPricing: 12,
    description:
      'O1 Mini emphasizes careful reasoning and analytical thinking. It demonstrates particular strength in STEM-related tasks, including mathematics, science, and programming, making it ideal for technical and academic applications.',
    website:
      'https://openai.com/index/openai-o1-mini-advancing-cost-efficient-reasoning/',
    tag: 'Premium',
  },
  {
    id: 'openai/o1-preview',
    name: 'O1 Preview',
    provider: 'OpenAI',
    contextWindow: 128_000,
    inputPricing: 15,
    outputPricing: 60,
    description:
      'O1 Preview specializes in advanced reasoning and complex problem-solving, particularly in STEM fields. It consistently demonstrates PhD-level understanding in physics, chemistry, and biology, making it ideal for scientific research and advanced technical applications.',
    website: 'https://openai.com/index/introducing-openai-o1-preview/',
    tag: 'Enterprise',
  },
]

const xAiModels: AIModel[] = [
  {
    id: 'x-ai/grok-beta',
    name: 'Grok Beta',
    provider: 'xAI',
    contextWindow: 131_000,
    inputPricing: 5,
    outputPricing: 15,
    description:
      'Grok excels at complex reasoning and multi-step problem solving. It demonstrates particular strength in technical analysis and creative problem-solving, while maintaining engaging conversational abilities.',
    website: 'https://x.ai/blog/grok-2',
    tag: 'Enterprise',
  },
]

export const aiModels: AIModel[] = [
  ...anthropicModels,
  ...googleModels,
  ...metaModels,
  ...mistralModels,
  ...openAiModels,
  ...xAiModels,
]
