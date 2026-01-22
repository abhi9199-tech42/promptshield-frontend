export interface AnalysisSegment {
  root: string;
  ops: string[];
  roles: Record<string, string>;
  meta: string | null;
}

export interface TokenMetrics {
  raw_tokens: number;
  compressed_tokens: number;
  savings_ratio: number;
}

export interface ExecuteResponse {
  provider: string;
  model: string | null;
  raw_text: string;
  compressed_text: string;
  output: string;
  tokens: TokenMetrics;
  analysis?: AnalysisSegment[];
  suggestions?: string[];
  confidence_score?: number;
}

export interface ActivityLog {
  id: number;
  provider: string;
  model: string | null;
  raw_text: string;
  compressed_text: string;
  raw_tokens: number;
  compressed_tokens: number;
  savings_ratio: number;
  latency_ms: number;
  created_at: string;
}
