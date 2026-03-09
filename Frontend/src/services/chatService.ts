import axios from '@/lib/axios';

interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
}

export const chatService = {
  sendMessage: async (message: string): Promise<string> => {
    // Ensure the key 'message' matches the parameter name in your Controller method
    const response = await axios.post<APIResponse<ChatResponse>>('/api/chat', {
      message: message, // Explicitly match your backend @RequestBody object
    });

    // Check if response.data.data exists
    return response.data.data.response;
  },
};
