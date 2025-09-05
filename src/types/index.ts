export interface User {
  id: string;
  name: string;
  email: string;
  role: 'hr' | 'manager';
}

export interface JobDescription {
  id: string;
  title: string;
  requirements: string;
  description: string;
  json: any;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  resume: string;
  score: number;
  status: 'new' | 'reviewed' | 'interviewed' | 'hired' | 'rejected' | 'on-hold';
  jobId: string;
  appliedAt: Date;
  interviewDate?: Date;
  sentimentScore?: {
    positive: number;
    negative: number;
    neutral: number;
    overall: 'positive' | 'negative' | 'neutral';
  };
  finalDecision?: 'hire' | 'reject' | 'on-hold';
  notes?: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  scheduledDate: Date;
  transcript?: string;
  sentimentAnalysis?: {
    positive: number;
    negative: number;
    neutral: number;
    overall: 'positive' | 'negative' | 'neutral';
  };
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DashboardStats {
  totalCandidates: number;
  interviewsScheduled: number;
  positionsOpen: number;
  hiringRate: number;
}