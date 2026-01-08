export type LearningStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface Word {
    id: string;
    term: string;
    definition: string;
    example: string;
    ipa?: string;
    status: LearningStatus;
    nextReviewDate: string | null; // ISO Date String
    reviewCount: number;
}

export interface Sentence {
    id: string;
    pattern: string;
    original: string;
    translation: string;
    situation: string;
    status: LearningStatus;
    nextReviewDate: string | null;
    reviewCount: number;
}

export interface UserStats {
    totalWords: number;
    masteredWords: number;
    totalSentences: number;
    masteredSentences: number;
    streakDays: number;
    lastStudyDate: string | null;
}
