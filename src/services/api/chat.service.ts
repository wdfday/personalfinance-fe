/**
 * AI Chat Service
 * Connects to backend chatbot API with SSE streaming support
 */

import { baseApiClient } from './base'
import type {
  ChatRequest,
  ChatResponse,
  Conversation,
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationRequest,
  ListConversationsParams,
  StreamEvent,
} from '@/types/chat'

class ChatService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  /**
   * Send a message and get AI response (non-streaming)
   * POST /chat
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return baseApiClient.post<ChatResponse>('/chat', request)
  }

  /**
   * Send a message and receive streaming response via SSE
   * POST /chat/stream
   */
  async *sendMessageStream(request: ChatRequest): AsyncGenerator<StreamEvent> {
    const response = await fetch(`${this.baseUrl}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        message: request.message,
        conversation_id: request.conversation_id,
        provider: request.provider,
      }),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      yield {
        type: 'error',
        data: { error: { code: 'API_ERROR', message: error.error || 'Failed to connect' } }
      }
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      yield {
        type: 'error',
        data: { error: { code: 'NO_STREAM', message: 'No response stream' } }
      }
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let currentEventType = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEventType = line.slice(7).trim()
            continue
          }
          
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            try {
              const data = JSON.parse(dataStr)
              
              // Use event type from SSE or infer from data
              const eventType = currentEventType || this.inferEventType(data)
              
              yield {
                type: eventType as StreamEvent['type'],
                data: this.mapEventData(eventType, data)
              }
              
              currentEventType = ''
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Infer event type from data structure
   */
  private inferEventType(data: Record<string, unknown>): string {
    if (data.conversation_id !== undefined && Object.keys(data).length <= 2) return 'start'
    if (data.content !== undefined) return 'delta'
    if (data.tool !== undefined) return 'tool_call'
    if (data.usage !== undefined) return 'end'
    if (data.error !== undefined) return 'error'
    if (data.thinking !== undefined) return 'thinking'
    return 'delta'
  }

  /**
   * Map server event data to client format
   */
  private mapEventData(eventType: string, data: Record<string, unknown>): StreamEvent['data'] {
    switch (eventType) {
      case 'start':
        return { conversation_id: data.conversation_id as string }
      case 'delta':
        return { content: data.content as string }
      case 'thinking':
        return { thinking: data.thinking as string }
      case 'tool_call':
        return { 
          tool: data.tool as string, 
          status: (data.status as 'executing' | 'completed' | 'failed') || 'executing',
          content: data.content as string
        }
      case 'tool_result':
        return {
          tool: data.tool as string,
          status: 'completed',
          result: data.result
        }
      case 'end':
        return { usage: data.usage as StreamEvent['data']['usage'] }
      case 'error':
        return { 
          error: { 
            code: (data.code as string) || 'STREAM_ERROR', 
            message: (data.error as string) || 'Unknown error' 
          } 
        }
      default:
        return data as StreamEvent['data']
    }
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('auth_token') || ''
  }

  /**
   * List user's conversations
   */
  async listConversations(params?: ListConversationsParams): Promise<ConversationListResponse> {
    return baseApiClient.get<ConversationListResponse>('/conversations', params)
  }

  /**
   * Get a specific conversation with messages
   */
  async getConversation(id: string, messageLimit?: number): Promise<ConversationDetailResponse> {
    return baseApiClient.get<ConversationDetailResponse>(`/conversations/${id}`, {
      message_limit: messageLimit,
    })
  }

  /**
   * Create a new conversation
   */
  async createConversation(request?: CreateConversationRequest): Promise<Conversation> {
    return baseApiClient.post<Conversation>('/conversations', request)
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await baseApiClient.delete<void>(`/conversations/${id}`)
  }

  /**
   * Update a conversation
   */
  async updateConversation(id: string, request: { title?: string; status?: string }): Promise<Conversation> {
    return baseApiClient.patch<Conversation>(`/conversations/${id}`, request)
  }
}

// Export singleton instance
export const chatService = new ChatService()
export default chatService
