// src/services/api/modules/trades.ts
import { request, API_BASE_URL, ApiError } from "../core";
import { supabase } from "@/integrations/supabase/client";
import type { 
  Trade, 
  CreateTradeInput, 
  UpdateTradeInput, 
  ExecutionCreate,
  ScreenshotUploadResponse, 
  TradeScreenshot,
  UploadResponse,
  ImportResult
} from "../types";

export const tradesApi = {
  /**
   * Fetch a single trade by ID.
   * Hits the FastAPI backend to retrieve sensitive decrypted data (notes/screenshots).
   */
  getOne: (id: string) => request<Trade>(`/trades/${id}`),

  /**
   * Create a new trade.
   * NOW: Requires 'initial_execution' to establish the financial baseline.
   */
  create: (data: CreateTradeInput) =>
    request<Trade>("/trades/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Add a new execution (Scale In/Out).
   * This triggers the backend recalculation engine to update avg_price, pnl, and status.
   */
  addExecution: (tradeId: string, data: ExecutionCreate) =>
    request<Trade>(`/trades/${tradeId}/executions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Update Trade METADATA only (Notes, Tags, Stop Loss).
   * Does NOT update Price/Qty (use addExecution for that).
   */
  update: (id: string, data: UpdateTradeInput) =>
    request<Trade>(`/trades/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Delete a trade.
   */
  delete: (id: string) =>
    request<void>(`/trades/${id}`, { method: "DELETE" }),

  /**
   * Export trades to CSV.
   * Authentication is manually handled via Supabase session token.
   */
  export: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) throw new Error("Authentication required for export");

    const response = await fetch(`${API_BASE_URL}/trades/export/csv`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 403) {
         throw new ApiError("Export is a PRO feature. Please upgrade.", 403);
      }
      throw new ApiError("Failed to export trades", response.status);
    }
    
    return response.blob();
  },

  /**
   * 1. Analyze CSV: Sends file to backend to detect headers & preview rows
   * Matches Backend: POST /trades/import/analyze
   */
  analyzeCsv: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<UploadResponse>("/trades/import/analyze", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * 2. Confirm Import: Sends file + mapping rules to process and save trades
   * Matches Backend: POST /trades/import/process
   */
  confirmImport: (file: File, mapping: Record<string, string>) => {
    const formData = new FormData();
    formData.append("file", file);
    // Send mapping as a JSON string field so backend can parse it
    formData.append("mapping", JSON.stringify(mapping));
    
    return request<ImportResult>("/trades/import/process", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Upload screenshots.
   * Supports atomic linking to a trade if tradeId is provided.
   */
  uploadScreenshots: (files: File[], tradeId?: string) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    
    // Append query param for atomic update
    const q = tradeId ? `?trade_id=${encodeURIComponent(tradeId)}` : "";
    
    return request<ScreenshotUploadResponse>(`/trades/uploads/trade-screenshots${q}`, {
      method: "POST",
      body: form,
      // Note: Do not set Content-Type header manually; the browser sets it with the boundary for FormData
    });
  },

  /**
   * Fetch signed URLs for a specific trade.
   * Matches Backend: GET /trades/{id}/screenshots
   */
  getScreenshots: (id: string) =>
    request<TradeScreenshot[]>(`/trades/${id}/screenshots`),
};