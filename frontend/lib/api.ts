import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface ChatRequest {
    message: string;
}

export interface ChatResponse {
    response: string;
}

export const chatAPI = {
    sendMessage: async (message: string): Promise<ChatResponse> => {
        const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, {
            message,
        });
        return response.data;
    },
};
