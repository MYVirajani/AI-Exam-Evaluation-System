// src/config/models.config.ts

export type ProviderValue = 'openai' | 'gemini' | 'deepseek' | 'anthropic';

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

// Provider configurations
export const PROVIDERS: ProviderOption[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'GPT models from OpenAI'
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    description: 'Claude models from Anthropic'
  },
  {
    value: 'gemini',
    label: 'Google Gemini',
    description: 'Gemini models from Google'
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    description: 'DeepSeek AI models'
  }
];

// Chat model configurations
export const CHAT_MODELS: ModelOption[] = [
  // OpenAI Models
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Most capable GPT-4 model'
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    provider: 'openai',
    description: 'High-intelligence flagship model'
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'openai',
    description: 'Optimized GPT-4 model'
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient model'
  },
  
  // Anthropic Models
  {
    value: 'claude-3-opus',
    label: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most capable Claude model'
  },
  {
    value: 'claude-3-sonnet',
    label: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Balanced performance and speed'
  },
  {
    value: 'claude-3-haiku',
    label: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and compact model'
  },
  {
    value: 'claude-2.1',
    label: 'Claude 2.1',
    provider: 'anthropic',
    description: 'Previous generation Claude'
  },
  
  // Google Gemini Models
  {
    value: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Latest generation Gemini with improved speed'
  },
  {
    value: 'gemini-pro',
    label: 'Gemini Pro',
    provider: 'gemini',
    description: 'Advanced reasoning and generation'
  },
  {
    value: 'gemini-pro-vision',
    label: 'Gemini Pro Vision',
    provider: 'gemini',
    description: 'Multimodal capabilities'
  },
  {
    value: 'gemini-ultra',
    label: 'Gemini Ultra',
    provider: 'gemini',
    description: 'Most capable Gemini model'
  },
  
  // DeepSeek Models
  {
    value: 'deepseek-chat',
    label: 'DeepSeek Chat',
    provider: 'deepseek',
    description: 'General purpose chat model'
  },
  {
    value: 'deepseek-coder',
    label: 'DeepSeek Coder',
    provider: 'deepseek',
    description: 'Optimized for coding tasks'
  }
];

// Embedding model configurations
export const EMBEDDING_MODELS: ModelOption[] = [
  // OpenAI Embeddings
  {
    value: 'text-embedding-3-large',
    label: 'Text Embedding 3 Large',
    provider: 'openai',
    description: 'Most capable OpenAI embedding'
  },
  {
    value: 'text-embedding-3-small',
    label: 'Text Embedding 3 Small',
    provider: 'openai',
    description: 'Efficient and cost-effective'
  },
  {
    value: 'text-embedding-ada-002',
    label: 'Text Embedding Ada 002',
    provider: 'openai',
    description: 'Previous generation embedding'
  },
  
  // Anthropic Embeddings
  {
    value: 'claude-embedding-v1',
    label: 'Claude Embedding v1',
    provider: 'anthropic',
    description: 'Anthropic embedding model'
  },
  
  // Google Gemini Embeddings
  {
    value: 'embedding-001',
    label: 'Gemini Embedding 001',
    provider: 'gemini',
    description: 'Google embedding model'
  },
  {
    value: 'text-embedding-004',
    label: 'Gemini Text Embedding 004',
    provider: 'gemini',
    description: 'Latest Google embedding'
  },
  
  // DeepSeek Embeddings
  {
    value: 'deepseek-embedding',
    label: 'DeepSeek Embedding',
    provider: 'deepseek',
    description: 'DeepSeek embedding model'
  }
];

// Helper functions
export const getProviderLabel = (value: ProviderValue): string => {
  return PROVIDERS.find(p => p.value === value)?.label || value;
};

export const getProviderValue = (label: string): ProviderValue | undefined => {
  return PROVIDERS.find(p => p.label === label)?.value;
};

export const getChatModelsByProvider = (provider: ProviderValue): ModelOption[] => {
  return CHAT_MODELS.filter(m => m.provider === provider);
};

export const getEmbeddingModelsByProvider = (provider: ProviderValue): ModelOption[] => {
  return EMBEDDING_MODELS.filter(m => m.provider === provider);
};

export const getChatModelLabel = (value: string): string => {
  return CHAT_MODELS.find(m => m.value === value)?.label || value;
};

export const getEmbeddingModelLabel = (value: string): string => {
  return EMBEDDING_MODELS.find(m => m.value === value)?.label || value;
};

export const getChatModelValue = (label: string): string | undefined => {
  return CHAT_MODELS.find(m => m.label === label)?.value;
};

export const getEmbeddingModelValue = (label: string): string | undefined => {
  return EMBEDDING_MODELS.find(m => m.label === label)?.value;
};