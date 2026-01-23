// src/components/trades/import/types.ts
/**
 * Import Feature Types
 * Matches src/services/api/types.ts Trade interface
 */
export type RowStatus = 'valid' | 'warning' | 'invalid';

// ✅ Matches API Trade keys exactly + NEW: exit_time, fees
export type ColumnMapping = 
  | 'entry_time'
  | 'symbol'
  | 'instrument_type'
  | 'direction'
  | 'quantity'
  | 'entry_price'
  | 'exit_price'
  | 'exit_time'  // ✨ NEW: Explicit exit timestamp
  | 'fees'       // ✨ NEW: Trading fees/commissions
  | 'stop_loss'
  | 'target'
  | 'pnl'
  | 'status'
  | 'notes'
  | 'tags'
  | 'strategy_id' // strategies (name)
  | 'ignore';

export interface MappingConfidence {
  level: 'high' | 'medium' | 'low';
  color: string;
}

// ✅ Internal Row Schema matching Trade Interface
export interface ImportRow {
  id: string;
  // Core
  entry_time: string;
  symbol: string;
  instrument_type: 'STOCK' | 'CRYPTO' | 'FOREX' | 'FUTURES';
  direction: 'LONG' | 'SHORT';
  quantity: number;
  entry_price: number;
  
  // Status & Exit
  status: 'OPEN' | 'CLOSED';
  exit_price?: number | null;
  exit_time?: string | null;  // ✨ NEW
  
  // Money
  fees?: number;  // ✨ NEW
  pnl?: number | null;
  
  // Risk
  stop_loss?: number | null;
  target?: number | null;
  
  // Meta
  notes?: string;
  tags?: string[];
  strategy_id?: string; // Will map to name during import
  
  // UI State
  status_type: RowStatus; 
  statusReason?: string;
  isEdited: boolean;
  isSelected: boolean;
}

export interface ColumnConfig {
  key: string;
  originalName: string;
  mapping: ColumnMapping;
  confidence: MappingConfidence;
}

export interface ImportState {
  fileName: string;
  rows: ImportRow[];
  columns: ColumnConfig[];
  advancedOptions: {
    skipDuplicates: boolean;
    overwriteExisting: boolean;
    tagImported: string;
    autoDetectStrategy: boolean;
  };
}

// ✅ Enhanced Demo Data with exit_time and fees populated
export const DEMO_IMPORT_DATA: ImportRow[] = [
  {
    id: '1',
    entry_time: '2025-01-20 09:15:00',
    symbol: 'RELIANCE',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 50,
    entry_price: 2420,
    status: 'CLOSED',
    exit_price: 2485,
    exit_time: '2025-01-20 15:30:00',
    fees: 45.50,
    pnl: 3204.50,
    stop_loss: 2380,
    target: 2500,
    strategy_id: 'Breakout',
    tags: ['momentum', 'nifty50'],
    notes: 'Strong volume breakout above resistance',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '2',
    entry_time: '2025-01-19 10:45:00',
    symbol: 'TCS',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 25,
    entry_price: 3850,
    status: 'CLOSED',
    exit_price: 3920,
    exit_time: '2025-01-19 14:20:00',
    fees: 28.75,
    pnl: 1721.25,
    stop_loss: 3820,
    target: 3950,
    strategy_id: 'Scalping',
    tags: ['IT', 'quick'],
    notes: 'Gap up play, hit target',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '3',
    entry_time: '2025-01-18 08:30:00',
    symbol: 'BTCUSDT',
    instrument_type: 'CRYPTO',
    direction: 'LONG',
    quantity: 0.15,
    entry_price: 42150,
    status: 'CLOSED',
    exit_price: 43200,
    exit_time: '2025-01-19 02:15:00',
    fees: 9.47,
    pnl: 148.03,
    stop_loss: 41500,
    target: 44000,
    strategy_id: 'Trend',
    tags: ['crypto', 'swing', 'btc'],
    notes: 'Overnight hold, caught uptrend',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '4',
    entry_time: '2025-01-17 11:00:00',
    symbol: 'NFLX',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 20,
    entry_price: 485,
    status: 'CLOSED',
    exit_price: 512,
    exit_time: '2025-01-17 15:45:00',
    fees: 18.20,
    pnl: 521.80,
    target: 520,
    strategy_id: 'Breakout',
    tags: ['earnings', 'US'],
    notes: 'Post-earnings momentum',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '5', // WARNING: Open trade, no exit data
    entry_time: '2025-01-16 13:20:00',
    symbol: 'INFY',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 30,
    entry_price: 1690,
    status: 'OPEN',
    exit_price: null,
    exit_time: null,
    fees: 0,
    pnl: 0,
    stop_loss: 1650,
    target: 1750,
    strategy_id: 'Pullback',
    tags: ['IT'],
    notes: 'Currently holding, near support',
    status_type: 'warning',
    statusReason: 'Open trade - exit data missing (expected)',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '6',
    entry_time: '2025-01-15 09:30:00',
    symbol: 'META',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 15,
    entry_price: 356,
    status: 'CLOSED',
    exit_price: 378,
    exit_time: '2025-01-16 10:15:00',
    fees: 12.60,
    pnl: 317.40,
    stop_loss: 345,
    target: 385,
    strategy_id: 'Momentum',
    tags: ['tech', 'megacap'],
    notes: 'Multi-day hold, strong momentum',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '7',
    entry_time: '2025-01-14 22:45:00',
    symbol: 'ETHUSDT',
    instrument_type: 'CRYPTO',
    direction: 'SHORT',
    quantity: 2.5,
    entry_price: 2285,
    status: 'CLOSED',
    exit_price: 2210,
    exit_time: '2025-01-15 06:30:00',
    fees: 8.56,
    pnl: 179.19,
    stop_loss: 2340,
    target: 2180,
    strategy_id: 'Reversal',
    tags: ['crypto', 'short', 'eth'],
    notes: 'Resistance rejection short',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '8', // INVALID: Negative quantity
    entry_time: '2025-01-13 10:00:00',
    symbol: 'HDFC',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: -10,
    entry_price: 1580,
    status: 'CLOSED',
    exit_price: 1620,
    exit_time: '2025-01-13 14:30:00',
    fees: 5.00,
    pnl: 395,
    strategy_id: 'Scalping',
    tags: [],
    status_type: 'invalid',
    statusReason: 'Invalid quantity: Negative values not allowed',
    isEdited: false,
    isSelected: false,
  },
  {
    id: '9',
    entry_time: '2025-01-12 11:20:00',
    symbol: 'TSLA',
    instrument_type: 'STOCK',
    direction: 'SHORT',
    quantity: 25,
    entry_price: 248,
    status: 'CLOSED',
    exit_price: 235,
    exit_time: '2025-01-12 15:50:00',
    fees: 14.50,
    pnl: 310.50,
    stop_loss: 258,
    target: 230,
    strategy_id: 'Reversal',
    tags: ['volatility', 'US', 'short'],
    notes: 'Overbought reversal play',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '10',
    entry_time: '2025-01-11 09:45:00',
    symbol: 'AAPL',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 40,
    entry_price: 195.50,
    status: 'CLOSED',
    exit_price: 198.75,
    exit_time: '2025-01-11 13:00:00',
    fees: 11.80,
    pnl: 118.20,
    stop_loss: 192,
    target: 202,
    strategy_id: 'Scalping',
    tags: ['range', 'tech'],
    notes: 'Range bound scalp',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '11',
    entry_time: '2025-01-10 10:15:00',
    symbol: 'WIPRO',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 100,
    entry_price: 435,
    status: 'CLOSED',
    exit_price: 460,
    exit_time: '2025-01-10 15:20:00',
    fees: 32.50,
    pnl: 2467.50,
    stop_loss: 425,
    target: 470,
    strategy_id: 'Breakout',
    tags: ['IT', 'midcap'],
    notes: 'Strong breakout with volume',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '12', // WARNING: Uncertain date format
    entry_time: '01/09/2025',
    symbol: 'ZOMATO',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 200,
    entry_price: 230,
    status: 'CLOSED',
    exit_price: 249.97,
    exit_time: '01/09/2025 14:45:00',
    fees: 54.99,
    pnl: 3939.01,
    target: 255,
    strategy_id: 'Momentum',
    tags: ['consumer', 'smallcap'],
    notes: 'News catalyst play',
    status_type: 'warning',
    statusReason: 'Date format uncertain - verify DD/MM vs MM/DD',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '13',
    entry_time: '2025-01-08 12:00:00',
    symbol: 'AMZN',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 30,
    entry_price: 186,
    status: 'CLOSED',
    exit_price: 192,
    exit_time: '2025-01-09 10:30:00',
    fees: 16.20,
    pnl: 163.80,
    stop_loss: 182,
    target: 195,
    strategy_id: 'Trend',
    tags: ['tech', 'megacap', 'swing'],
    notes: 'Trend continuation, held overnight',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '14',
    entry_time: '2025-01-07 09:00:00',
    symbol: 'GOOGL',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 25,
    entry_price: 175,
    status: 'CLOSED',
    exit_price: 181,
    exit_time: '2025-01-07 14:00:00',
    fees: 13.50,
    pnl: 136.50,
    stop_loss: 170,
    target: 185,
    strategy_id: 'Pullback',
    tags: ['tech', 'dip'],
    notes: 'Bought the pullback',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '15',
    entry_time: '2025-01-06 11:30:00',
    symbol: 'NVDA',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 10,
    entry_price: 485,
    status: 'CLOSED',
    exit_price: 512,
    exit_time: '2025-01-06 15:45:00',
    fees: 9.97,
    pnl: 260.03,
    stop_loss: 475,
    target: 520,
    strategy_id: 'Momentum',
    tags: ['AI', 'tech', 'hot'],
    notes: 'AI hype continuation',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '16',
    entry_time: '2025-01-05 08:00:00',
    symbol: 'SOLUSDT',
    instrument_type: 'CRYPTO',
    direction: 'LONG',
    quantity: 50,
    entry_price: 98.50,
    status: 'CLOSED',
    exit_price: 112.30,
    exit_time: '2025-01-06 04:20:00',
    fees: 15.69,
    pnl: 674.31,
    stop_loss: 92,
    target: 120,
    strategy_id: 'Breakout',
    tags: ['crypto', 'alt', 'sol'],
    notes: 'Altcoin season play',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '17',
    entry_time: '2025-01-04 10:45:00',
    symbol: 'BAJFINANCE',
    instrument_type: 'STOCK',
    direction: 'SHORT',
    quantity: 5,
    entry_price: 7250,
    status: 'CLOSED',
    exit_price: 7120,
    exit_time: '2025-01-04 15:15:00',
    fees: 27.50,
    pnl: 622.50,
    stop_loss: 7350,
    target: 7050,
    strategy_id: 'Reversal',
    tags: ['banking', 'NBFC', 'short'],
    notes: 'Resistance short',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '18',
    entry_time: '2025-01-03 09:20:00',
    symbol: 'SBIN',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 75,
    entry_price: 815,
    status: 'CLOSED',
    exit_price: 842,
    exit_time: '2025-01-03 14:50:00',
    fees: 29.25,
    pnl: 1995.75,
    stop_loss: 800,
    target: 860,
    strategy_id: 'Trend',
    tags: ['banking', 'PSU', 'largecap'],
    notes: 'PSU bank rally',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '19',
    entry_time: '2025-01-02 11:00:00',
    symbol: 'ICICIBANK',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 40,
    entry_price: 1245,
    status: 'CLOSED',
    exit_price: 1282,
    exit_time: '2025-01-02 15:30:00',
    fees: 22.80,
    pnl: 1457.20,
    stop_loss: 1225,
    target: 1300,
    strategy_id: 'Pullback',
    tags: ['banking', 'private'],
    notes: 'Support bounce trade',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '20',
    entry_time: '2025-01-01 10:00:00',
    symbol: 'TATAMOTORS',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 60,
    entry_price: 785,
    status: 'CLOSED',
    exit_price: 812,
    exit_time: '2025-01-01 15:00:00',
    fees: 23.40,
    pnl: 1596.60,
    stop_loss: 770,
    target: 825,
    strategy_id: 'Momentum',
    tags: ['auto', 'sector-rotation'],
    notes: 'Auto sector strength',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '21',
    entry_time: '2024-12-30 09:15:00',
    symbol: 'ADANIPORTS',
    instrument_type: 'STOCK',
    direction: 'LONG',
    quantity: 35,
    entry_price: 1220,
    status: 'CLOSED',
    exit_price: 1265,
    exit_time: '2024-12-30 14:30:00',
    fees: 19.75,
    pnl: 1555.25,
    stop_loss: 1195,
    target: 1280,
    strategy_id: 'Breakout',
    tags: ['infrastructure', 'adani'],
    notes: 'Infrastructure rally play',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
  {
    id: '22',
    entry_time: '2024-12-29 13:45:00',
    symbol: 'LINKUSDT',
    instrument_type: 'CRYPTO',
    direction: 'LONG',
    quantity: 100,
    entry_price: 14.25,
    status: 'CLOSED',
    exit_price: 15.80,
    exit_time: '2024-12-30 08:20:00',
    fees: 2.85,
    pnl: 152.15,
    stop_loss: 13.50,
    target: 16.50,
    strategy_id: 'Swing',
    tags: ['crypto', 'defi', 'link'],
    notes: 'DeFi season continuation',
    status_type: 'valid',
    isEdited: false,
    isSelected: true,
  },
];

// ✅ Updated Column Config with new fields
export const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = [
  { key: 'col_sym', originalName: 'Symbol', mapping: 'symbol', confidence: { level: 'high', color: 'emerald' } },
  { key: 'col_date', originalName: 'Entry Date', mapping: 'entry_time', confidence: { level: 'high', color: 'emerald' } },
  { key: 'col_side', originalName: 'Side', mapping: 'direction', confidence: { level: 'high', color: 'emerald' } },
  { key: 'col_type', originalName: 'Type', mapping: 'instrument_type', confidence: { level: 'high', color: 'emerald' } },
  { key: 'col_ep', originalName: 'Entry Price', mapping: 'entry_price', confidence: { level: 'high', color: 'emerald' } },
  { key: 'col_qty', originalName: 'Qty', mapping: 'quantity', confidence: { level: 'high', color: 'emerald' } },
  { key: 'col_xp', originalName: 'Exit Price', mapping: 'exit_price', confidence: { level: 'medium', color: 'emerald' } },
  { key: 'col_xtime', originalName: 'Exit Time', mapping: 'exit_time', confidence: { level: 'medium', color: 'yellow' } }, // ✨ NEW
  { key: 'col_fees', originalName: 'Fees', mapping: 'fees', confidence: { level: 'medium', color: 'yellow' } }, // ✨ NEW
  { key: 'col_pnl', originalName: 'PnL', mapping: 'pnl', confidence: { level: 'high', color: 'emerald' } },
  { key: 'col_strat', originalName: 'Strategy', mapping: 'strategy_id', confidence: { level: 'medium', color: 'yellow' } },
  { key: 'col_stat', originalName: 'Status', mapping: 'status', confidence: { level: 'medium', color: 'yellow' } },
  { key: 'col_tags', originalName: 'Tags', mapping: 'tags', confidence: { level: 'low', color: 'gray' } },
];

export const MAPPING_OPTIONS: { value: ColumnMapping; label: string }[] = [
  { value: 'entry_time', label: 'Entry Date/Time' },
  { value: 'symbol', label: 'Symbol' },
  { value: 'instrument_type', label: 'Instrument Type' },
  { value: 'direction', label: 'Direction (Long/Short)' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'entry_price', label: 'Entry Price' },
  { value: 'exit_price', label: 'Exit Price' },
  { value: 'exit_time', label: '✨ Exit Date/Time' }, // ✨ NEW
  { value: 'fees', label: '✨ Fees/Commissions' }, // ✨ NEW
  { value: 'status', label: 'Status (Open/Closed)' },
  { value: 'pnl', label: 'PnL' },
  { value: 'stop_loss', label: 'Stop Loss' },
  { value: 'target', label: 'Target/TP' },
  { value: 'strategy_id', label: 'Strategy' },
  { value: 'notes', label: 'Notes' },
  { value: 'tags', label: 'Tags' },
  { value: 'ignore', label: 'Ignore Column' },
];