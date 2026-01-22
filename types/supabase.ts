export interface UserProfile {
  id: string
  company_name: string
  plan: 'starter' | 'professional' | 'business'
  website_limit: number
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled'
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Website {
  id: string
  url: string
  domain: string
  client_name: string
  owner_id: string
  scan_frequency: 'daily' | 'weekly' | 'monthly'
  last_scan_at: string | null
  next_scan_at: string | null
  status: 'active' | 'paused' | 'error'
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Scan {
  id: string
  website_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  violations_count: number
  risk_score: number
  results: ScanResults | null
  error_log: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ScanResults {
  google_fonts?: ViolationDetail
  cookies?: ViolationDetail
  impressum?: ViolationDetail
  us_transfers?: ViolationDetail
}

export interface ViolationDetail {
  status: 'compliant' | 'violation' | 'warning'
  severity: 'low' | 'medium' | 'high'
  description_de: string
  recommendation_de: string
  technical_details?: any
}
