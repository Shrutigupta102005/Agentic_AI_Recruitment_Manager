export interface Analysis {
    recommendation: string;
    matched_skills: string[];
    missing_skills: string[];
    experience_years: string;
    education: string;
    strengths: string[];
    weaknesses: string[];
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    resume: string;
    score: number;
    status: 'new' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
    jobId: string;
    appliedAt: Date | string;
    file?: File;
    analysis?: Analysis;
}

export interface Interview {
    id: string;
    candidateId: string;
    candidateName: string;
    date: string;
    score?: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    feedback?: string;
}
