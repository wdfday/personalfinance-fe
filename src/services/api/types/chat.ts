// Chatbot Types
export interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  token_count?: number
  latency_ms?: number
  model?: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  status: string
  provider: string
  model?: string
  last_message?: string
  message_count?: number
  created_at: string
  updated_at: string
}

export interface ChatRequest {
  message: string
  conversation_id?: string
  provider?: string
}

export interface ChatResponse {
  conversation_id: string
  message: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  tools_used?: string[]
}

export interface ConversationListResponse {
  conversations: Conversation[]
  total: number
  has_more: boolean
}

export interface ConversationDetailResponse {
  conversation: Conversation
  messages: ChatMessage[]
}
