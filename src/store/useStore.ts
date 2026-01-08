import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Word, Sentence, UserStats, LearningStatus } from '../types';
import initialData from '../data/initial_data.json';

interface AppState {
    words: Word[];
    sentences: Sentence[];
    stats: UserStats;

    // Actions
    initializeData: () => void;
    addWord: (word: Omit<Word, 'id' | 'status' | 'nextReviewDate' | 'reviewCount'>) => void;
    updateWordStatus: (id: string, isCorrect: boolean) => void;
    importData: (data: { words: Word[], sentences: Sentence[] }) => void;
    resetProgress: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            words: [],
            sentences: [],
            stats: {
                totalWords: 0,
                masteredWords: 0,
                totalSentences: 0,
                masteredSentences: 0,
                streakDays: 0,
                lastStudyDate: null,
            },

            initializeData: () => {
                const { words, sentences } = get();
                if (words.length === 0 && sentences.length === 0) {
                    // Import initial data and cast to correct types if needed
                    const initialWords = initialData.words.map(w => ({
                        ...w,
                        status: 'new' as LearningStatus,
                        reviewCount: 0,
                        nextReviewDate: null
                    }));

                    const initialSentences = initialData.sentences.map(s => ({
                        ...s,
                        status: 'new' as LearningStatus,
                        reviewCount: 0,
                        nextReviewDate: null
                    }));

                    set({
                        words: initialWords,
                        sentences: initialSentences,
                        stats: {
                            ...get().stats,
                            totalWords: initialWords.length,
                            totalSentences: initialSentences.length
                        }
                    });
                }
            },

            addWord: (newWord) => set((state) => {
                const word: Word = {
                    ...newWord,
                    id: `custom_${Date.now()}`,
                    status: 'new',
                    nextReviewDate: null,
                    reviewCount: 0,
                };
                return {
                    words: [...state.words, word],
                    stats: { ...state.stats, totalWords: state.words.length + 1 }
                };
            }),

            updateWordStatus: (id, isCorrect) => set((state) => {
                // Simple Leitner System logic placeholder
                // TODO: Implement actual spaced repetition algorithm later
                const wordIndex = state.words.findIndex(w => w.id === id);
                if (wordIndex === -1) return state;

                const updatedWords = [...state.words];
                const word = updatedWords[wordIndex];

                let newStatus: LearningStatus = word.status;
                let newReviewCount = word.reviewCount + 1;

                if (isCorrect) {
                    if (word.status === 'new') newStatus = 'learning';
                    else if (word.status === 'learning') newStatus = 'review';
                    else if (word.status === 'review') newStatus = 'mastered';
                } else {
                    newStatus = 'learning'; // Downgrade if wrong
                }

                updatedWords[wordIndex] = {
                    ...word,
                    status: newStatus,
                    reviewCount: newReviewCount,
                    nextReviewDate: new Date().toISOString() // Review immediately or implemented later
                };

                const masteredCount = updatedWords.filter(w => w.status === 'mastered').length;

                return {
                    words: updatedWords,
                    stats: { ...state.stats, masteredWords: masteredCount }
                };
            }),

            importData: (data) => set((state) => {
                // Merge strategy: Append new items, filter out duplicates by ID
                const existingWordIds = new Set(state.words.map(w => w.id));
                const newWords = data.words.filter(w => !existingWordIds.has(w.id));

                const existingSentenceIds = new Set(state.sentences.map(s => s.id));
                const newSentences = data.sentences.filter(s => !existingSentenceIds.has(s.id));

                const finalWords = [...state.words, ...newWords];
                const finalSentences = [...state.sentences, ...newSentences];

                return {
                    words: finalWords,
                    sentences: finalSentences,
                    stats: {
                        ...state.stats,
                        totalWords: finalWords.length,
                        totalSentences: finalSentences.length
                    }
                };
            }),

            resetProgress: () => {
                localStorage.removeItem('english-learning-storage');
                window.location.reload();
            }
        }),
        {
            name: 'english-learning-storage',
        }
    )
);
