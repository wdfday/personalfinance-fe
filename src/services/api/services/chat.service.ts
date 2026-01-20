// Chat Service
import { apiClient } from '../client'
import type { 
  ChatRequest, 
  ChatResponse, 
  Conversation, 
  ConversationListResponse, 
  ConversationDetailResponse 
} from '../types/chat'

export const chatService = {
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/chatbot/chat', data)
  },

  async getConversations(limit = 20, offset = 0): Promise<ConversationListResponse> {
    return apiClient.get<ConversationListResponse>(`/chatbot/conversations?limit=${limit}&offset=${offset}`)
  },

  async getConversation(id: string): Promise<ConversationDetailResponse> {
    return apiClient.get<ConversationDetailResponse>(`/chatbot/conversations/${id}`)
  },

  async deleteConversation(id: string): Promise<void> {
    return apiClient.delete(`/chatbot/conversations/${id}`)
  },
  
  async updateConversation(id: string, data: { title: string }): Promise<Conversation> {
    return apiClient.put<Conversation>(`/chatbot/conversations/${id}`, data)
  }
}

export default chatService
