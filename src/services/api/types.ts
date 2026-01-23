// src/services/api/types.ts

// ------------------------------------------------------------------
// Enums (Matches app/schemas/common_schemas.py)
// ------------------------------------------------------------------
export type PlanTier = "FREE" | "PRO" | "PREMIUM"; 
export type InstrumentType = "STOCK" | "CRYPTO" | "FOREX" | "FUTURES";
export type TradeSide = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED";
export type ExecutionSide = "BUY" | "SELL"; // ✅ NEW: For executions
export type UserRole = "user" | "admin" | "super_admin" | "support";

// ------------------------------------------------------------------
// User & Auth (SYNCED WITH core.ts)
// ------------------------------------------------------------------
export interface UserProfile {
  id: string;          // Frontend ID
  user_id: string;     // Backend ID mapping
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  plan_tier: PlanTier;
  role: UserRole;
  
  // Usage Stats (from user_profiles table)
  daily_chat_count: number;
  monthly_ai_tokens_used: number;
  monthly_import_count: number;
  
  // Reset Timestamps
  last_chat_reset_at?: string;
  quota_reset_at?: string;
  
  created_at: string;
}

export interface UserUsageReport {
  plan: PlanTier;
  chat: {
    used: number;
    limit: number;
  };
  imports: {
    used: number;
    limit: number;
  };
  trades: {
    used: number;
    limit: number | null; 
  };
  ai_cost_tokens: number;
}

// ------------------------------------------------------------------
// Executions (✅ NEW: Relational Model)
// ------------------------------------------------------------------
export interface Execution {
  id: string;
  trade_id: string;
  user_id: string;
  execution_time: string;
  side: ExecutionSide;
  price: number;
  quantity: number;
  fees: number;
  broker_order_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ExecutionCreate {
  execution_time: string;
  side: ExecutionSide;
  price: number;
  quantity: number;
  fees: number;
  broker_order_id?: string;
  metadata?: Record<string, any>;
}

// ------------------------------------------------------------------
// Trades (Matches app/schemas/trade_schemas.py)
// ------------------------------------------------------------------
export interface Trade {
  id: string;
  user_id: string;
  
  // Core Info
  symbol: string;
  instrument_type: InstrumentType;
  direction: TradeSide;
  status: TradeStatus;

  // ✅ Financial State (Calculated Aggregate)
  avg_price: number;      // WAS: entry_price
  net_quantity: number;   // WAS: quantity
  total_pnl: number;      // WAS: pnl
  total_fees: number;     // WAS: fees
  
  start_time: string;     // WAS: entry_time
  created_at: string;

  // Metadata
  stop_loss?: number | null;
  target?: number | null;
  notes?: string | null;
  encrypted_notes?: string | null; 
  tags?: string[];
  
  // Screenshots
  screenshots?: string[] | null; 
  // ✅ Signed URLs for secure display
  screenshots_signed?: { path: string; url: string }[] | null;

  // Relations
  strategy_id?: string | null;
  strategies?: {
    name: string;
    emoji?: string;
  } | null;
  
  // ✅ The History
  executions: Execution[];
  
  metadata?: Record<string, any>;
}

export interface CreateTradeInput {
  // Container Info
  symbol: string;
  instrument_type: InstrumentType;
  direction: TradeSide;
  
  // Container Targets
  stop_loss?: number;
  target?: number;
  
  // Metadata
  notes?: string;
  tags?: string[];
  strategy_id?: string;
  screenshots?: string[];
  metadata?: Record<string, any>;

  // ✅ The Primary Trigger (Instead of flat price/qty)
  initial_execution: ExecutionCreate;
}

export interface UpdateTradeInput {
  // ✅ Restricted to Metadata Updates Only
  stop_loss?: number;
  target?: number;
  notes?: string;
  tags?: string[];
  strategy_id?: string;
  screenshots?: string[];
  metadata?: Record<string, any>;
}

export interface PaginatedTradesResponse {
  data: Trade[];
  total: number;
  page: number;
  size: number;
}

// ------------------------------------------------------------------
// Strategies (Matches app/schemas/strategy_schemas.py)
// ------------------------------------------------------------------
export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  emoji: string;
  color_hex: string;
  style?: string | null;
  
  instrument_types: InstrumentType[];
  rules: Record<string, string[]>;
  track_missed_trades: boolean;
  
  created_at: string;
  updated_at?: string | null;
}

export interface CreateStrategyInput {
  name: string;
  description?: string;
  emoji?: string;
  color_hex?: string;
  style?: string;
  instrument_types?: InstrumentType[];
  rules?: Record<string, string[]>;
  track_missed_trades?: boolean;
}

// ------------------------------------------------------------------
// AI Chat (Matches app/schemas/chat_schemas.py)
// ------------------------------------------------------------------
export interface ChatSession {
  id: string;
  topic: string;
  created_at: string;
}

export interface SessionUpdate {
  topic: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  model?: string; 
  provider?: string;
  web_search?: boolean;
}

export interface ChatUsage {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  search_context_size?: number | string; 
  cost?: number | Record<string, number>; 
}

export interface ToolCallData {
  type: string; 
  data: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  usage?: ChatUsage;
  tool_call?: ToolCallData;
}

// ------------------------------------------------------------------
// Utilities / Uploads
// ------------------------------------------------------------------
export interface UploadResponse {
  // Matches backend CSVParser.analyze_structure + heuristics
  headers: string[];
  preview: Record<string, any>[];
  mapping: Record<string, string>; // Suggested mapping from backend
  message?: string;
  filename?: string;
}

export interface ImportConfirmSchema {
  file_path?: string;
  mapping: Record<string, string>;
  session_id?: string;
}

export interface ImportResult {
  count: number;
  skipped: number;
  errors?: string[];
}

export interface ScreenshotUploadResponse {
  files: { filename: string; url: string }[];
  uploaded_to_trade: boolean;
  count: number;
}

export interface TradeScreenshot {
  url: string;
  name?: string;
  uploaded_at?: string;
}

export interface BrokerAccount {
  id: string;
  broker_name: string;
  api_key_last_digits: string;
  last_sync_time?: string;
  is_active: boolean;
  created_at: string;
}

export interface NewsResult {
  answer: string;
  sources: { title: string; url: string; snippet?: string }[];
  related_questions: string[];
}

export interface DashboardStats {
  netPL: number;
  grossProfit: number;
  grossLoss: number;
  fees: number;
  maxDrawdown: number;
  profitFactor: number;
  winRate: number;
  payoffRatio: number;
  expectancy: number;
  sharpeRatio: number;
  sqn: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgHoldTimeHours: number;
  maxWinStreak: number;
  maxLossStreak: number;
  longWinRate: number;
  shortWinRate: number;
  dailyData: { date: string; value: number }[];
  cumulativeData: { date: string; value: number }[];
  strategyPerformance: { name: string; value: number }[];
  topInstruments: { symbol: string; type: string; pnl: number; winRate: number }[];
}

// ------------------------------------------------------------------
// Calendar (Specific for Calendar View)
// ------------------------------------------------------------------
export interface CalendarTrade {
  id: string;
  symbol: string;
  direction: string; 
  pnl: number;
  strategy: string;
}

export interface DayData {
  date: Date;
  totalPnL: number;
  tradeCount: number;
  winRate: number;
  bestStrategy: string;
  emotion: string;
  trades: CalendarTrade[]; 
  note?: string;
}