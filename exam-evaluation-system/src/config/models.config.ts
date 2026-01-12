// src/config/models.config.ts

// =====================
// Types
// =====================

export type ProviderValue =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'finetuneddeepseek';

export interface ProviderOption {
  value: ProviderValue;
  label: string;
  description?: string;
}

export interface ModelOption {
  value: string;
  label: string;
  provider: ProviderValue;
  description?: string;
}

// =====================
// Provider configurations
// =====================

export const PROVIDERS: ProviderOption[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'GPT models provided by OpenAI'
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    description: 'Claude models provided by Anthropic'
  },
  {
    value: 'gemini',
    label: 'Google Gemini',
    description: 'Gemini models provided by Google'
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    description: 'Base DeepSeek AI models'
  }
];

// =====================
// Chat model configurations
// =====================

export const CHAT_MODELS: ModelOption[] = [
  // OpenAI
  // {
  //   value: 'gpt-4-turbo',
  //   label: 'GPT-4 Turbo',
  //   provider: 'openai',
  //   description: 'Most capable GPT-4 Turbo model'
  // },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    provider: 'openai',
    description: 'High-intelligence flagship GPT-4 model'
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'openai',
    description: 'Optimized multimodal GPT-4 model'
  },
  // {
  //   value: 'gpt-3.5-turbo',
  //   label: 'GPT-3.5 Turbo',
  //   provider: 'openai',
  //   description: 'Fast and cost-efficient model'
  // },

  // Anthropic
  // {
  //   value: 'claude-3-opus',
  //   label: 'Claude 3 Opus',
  //   provider: 'anthropic',
  //   description: 'Most capable Claude 3 model'
  // },
  {
    value: 'claude-3-sonnet',
    label: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Balanced performance and speed'
  },
  // {
  //   value: 'claude-3-haiku',
  //   label: 'Claude 3 Haiku',
  //   provider: 'anthropic',
  //   description: 'Fast, lightweight model'
  // },
  // {
  //   value: 'claude-2.1',
  //   label: 'Claude 2.1',
  //   provider: 'anthropic',
  //   description: 'Previous-generation Claude model'
  // },

  // Google Gemini
  {
    value: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Latest Gemini model optimized for speed'
  },
  // {
  //   value: 'gemini-pro',
  //   label: 'Gemini Pro',
  //   provider: 'gemini',
  //   description: 'Advanced reasoning and generation'
  // },
  // {
  //   value: 'gemini-pro-vision',
  //   label: 'Gemini Pro Vision',
  //   provider: 'gemini',
  //   description: 'Multimodal text + vision model'
  // },
  // {
  //   value: 'gemini-ultra',
  //   label: 'Gemini Ultra',
  //   provider: 'gemini',
  //   description: 'Most capable Gemini model'
  // },

  // DeepSeek
  // {
  //   value: 'deepseek-chat',
  //   label: 'DeepSeek Chat',
  //   provider: 'deepseek',
  //   description: 'General-purpose chat model'
  // },
  // {
  //   value: 'deepseek-coder',
  //   label: 'DeepSeek Coder',
  //   provider: 'deepseek',
  //   description: 'Optimized for coding tasks'
  // },
  {
    value: 'deepseek-r1:7b',
    label: 'DeepSeek R1 7B',
    provider: 'deepseek',
    description: 'Local DeepSeek R1 7B model'
  },
  {
    value: 'deepseek-r1:7b',
    label: 'DeepSeek (Fine-tuned)',
    provider: 'finetuneddeepseek',
    description: 'Local DeepSeek R1 7B fine-tuned model'
  }
];

// =====================
// Embedding model configurations
// =====================

export const EMBEDDING_MODELS: ModelOption[] = [
  // OpenAI
  // {
  //   value: 'text-embedding-3-large',
  //   label: 'Text Embedding 3 Large',
  //   provider: 'openai',
  //   description: 'Most capable OpenAI embedding model'
  // },
  {
    value: 'text-embedding-3-small',
    label: 'Text Embedding 3 Small',
    provider: 'openai',
    description: 'Efficient and cost-effective embedding'
  },
  // {
  //   value: 'text-embedding-ada-002',
  //   label: 'Text Embedding Ada 002',
  //   provider: 'openai',
  //   description: 'Legacy OpenAI embedding model'
  // },

  // Anthropic
  // {
  //   value: 'claude-embedding-v1',
  //   label: 'Claude Embedding v1',
  //   provider: 'anthropic',
  //   description: 'Anthropic embedding model'
  // },

  // Google Gemini
  {
    value: 'embedding-001',
    label: 'Gemini Embedding 001',
    provider: 'gemini',
    description: 'Google embedding model'
  },
  // {
  //   value: 'text-embedding-004',
  //   label: 'Gemini Text Embedding 004',
  //   provider: 'gemini',
  //   description: 'Latest Gemini embedding model'
  // },

  // DeepSeek
  // {
  //   value: 'deepseek-embedding',
  //   label: 'DeepSeek Embedding',
  //   provider: 'deepseek',
  //   description: 'DeepSeek embedding model'
  // }
];

// =====================
// Helper functions
// =====================

export const getProviderLabel = (value: ProviderValue): string =>
  PROVIDERS.find(p => p.value === value)?.label || value;

export const getProviderValue = (label: string): ProviderValue | undefined =>
  PROVIDERS.find(p => p.label === label)?.value;

export const getChatModelsByProvider = (provider: ProviderValue): ModelOption[] => {
  if (provider === 'deepseek') {
    return CHAT_MODELS.filter(
      m => m.provider === 'deepseek' || m.provider === 'finetuneddeepseek'
    );
  }

  return CHAT_MODELS.filter(m => m.provider === provider);
};


// ⭐ Business rule:
// DeepSeek & Anthropic can access ALL embedding models
export const getEmbeddingModelsByProvider = (
  provider: ProviderValue
): ModelOption[] => {
  if (provider === 'deepseek' || provider === 'finetuneddeepseek' || provider === 'anthropic') {
    return EMBEDDING_MODELS;
  }
  return EMBEDDING_MODELS.filter(m => m.provider === provider);
};

export const getChatModelLabel = (value: string): string =>
  CHAT_MODELS.find(m => m.value === value)?.label || value;

export const getEmbeddingModelLabel = (value: string): string =>
  EMBEDDING_MODELS.find(m => m.value === value)?.label || value;

export const getChatModelValue = (label: string): string | undefined =>
  CHAT_MODELS.find(m => m.label === label)?.value;

export const getEmbeddingModelValue = (label: string): string | undefined =>
  EMBEDDING_MODELS.find(m => m.label === label)?.value;
