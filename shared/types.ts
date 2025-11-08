export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// FinCast specific types
export interface StockDataPoint {
  date: string;
  price: number;
  isPrediction?: boolean;
}
export interface PredictionRequest {
  ticker: string;
  days: number;
}