import type { Candidate, Interview, DashboardStats } from '../types';

export const mockCandidates: Candidate[] = [
  {
    id: 'candidate-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    resume: 'alice-johnson-resume.pdf',
    score: 92,
    status: 'reviewed',
    jobId: 'job-1',
    appliedAt: new Date('2024-01-15'),
  },
  {
    id: 'candidate-2',
    name: 'Bob Smith',
    email: 'bob.smith@email.com',
    resume: 'bob-smith-resume.pdf',
    score: 78,
    status: 'interviewed',
    jobId: 'job-1',
    appliedAt: new Date('2024-01-14'),
    interviewDate: new Date('2024-01-20'),
    sentimentScore: {
      positive: 65,
      negative: 15,
      neutral: 20,
      overall: 'positive'
    }
  },
  {
    id: 'candidate-3',
    name: 'Carol White',
    email: 'carol.white@email.com',
    resume: 'carol-white-resume.pdf',
    score: 88,
    status: 'hired',
    jobId: 'job-1',
    appliedAt: new Date('2024-01-13'),
    finalDecision: 'hire'
  },
  {
    id: 'candidate-4',
    name: 'David Brown',
    email: 'david.brown@email.com',
    resume: 'david-brown-resume.pdf',
    score: 65,
    status: 'rejected',
    jobId: 'job-1',
    appliedAt: new Date('2024-01-12'),
    finalDecision: 'reject'
  },
  {
    id: 'candidate-5',
    name: 'Eva Davis',
    email: 'eva.davis@email.com',
    resume: 'eva-davis-resume.pdf',
    score: 83,
    status: 'reviewed',
    jobId: 'job-1',
    appliedAt: new Date('2024-01-11'),
  },
];

export const mockInterviews: Interview[] = [
  {
    id: 'interview-1',
    candidateId: 'candidate-2',
    scheduledDate: new Date('2024-01-20T10:00:00'),
    status: 'completed',
    transcript: 'Mock interview transcript content...',
    sentimentAnalysis: {
      positive: 65,
      negative: 15,
      neutral: 20,
      overall: 'positive'
    }
  },
];

export const mockDashboardStats: DashboardStats = {
  totalCandidates: 45,
  interviewsScheduled: 12,
  positionsOpen: 8,
  hiringRate: 32
};