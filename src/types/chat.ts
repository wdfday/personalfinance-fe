/**
 * AI Chat Types
 * Based on server/md/ai-chatbot/08_API_REFERENCE.md
 */

// ============================================
// ENUMS
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';
export type ConversationStatus = 'active' | 'archived' | 'deleted';
export type StreamEventType = 'start' | 'delta' | 'thinking' | 'tool_call' | 'tool_result' | 'end' | 'error';
export type ChatProvider = 'gemini' | 'claude';

// ============================================
// CORE INTERFACES
// ============================================

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  metadata?: MessageMetadata;
  created_at: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id: string;
  content: string;
  is_error: boolean;
}

export interface MessageMetadata {
  token_count?: number;
  latency_ms?: number;
  model?: string;
  finish_reason?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  status: ConversationStatus;
  metadata?: ConversationMetadata;
  last_message?: string;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMetadata {
  provider: ChatProvider;
  model?: string;
  total_tokens?: number;
  total_cost?: number;
  tags?: string[];
  custom_data?: Record<string, unknown>;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  provider?: ChatProvider;
}

export interface CreateConversationRequest {
  title?: string;
  provider?: ChatProvider;
}

export interface UpdateConversationRequest {
  title?: string;
  status?: ConversationStatus;
}

export interface ListConversationsParams {
  limit?: number;
  offset?: number;
  status?: ConversationStatus;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface ChatResponse {
  conversation_id: string;
  message: string;
  usage?: TokenUsage;
  tools_used?: string[];
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  has_more: boolean;
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: ChatMessage[];
}

// ============================================
// STREAMING TYPES
// ============================================

export interface StreamEvent {
  type: StreamEventType;
  data: StreamEventData;
}

export interface StreamEventData {
  conversation_id?: string;
  content?: string;
  thinking?: string;
  tool?: string;
  status?: 'executing' | 'completed' | 'failed';
  arguments?: Record<string, unknown>;
  result?: unknown;
  usage?: TokenUsage;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// ERROR TYPES
// ============================================

export interface ChatError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ChatErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'INTERNAL_ERROR';

// ============================================
// UI STATE TYPES
// ============================================

export interface ChatUIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  thinking?: string;
  isThinking?: boolean;
  toolCalls?: ToolCall[];
  toolResults?: { tool: string; status: string; result?: string }[];
  error?: string;
}

export interface ChatUIState {
  messages: ChatUIMessage[];
  conversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}
