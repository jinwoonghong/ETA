import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Flashcard } from '../components/Flashcard';
import { ArrowLeft, Volume2, Check, X } from 'lucide-react';
import type { Word } from '../types';
import { motion } from 'framer-motion';

export const WordStudyPage = () => {
    const navigate = useNavigate();
    const { words, updateWordStatus } = useStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [studySet, setStudySet] = useState<Word[]>([]);

    useEffect(() => {
        // Simple algorithm: focus on 'new' and 'learning' words first
        const learning = words.filter(w => w.status !== 'mastered');
        const mastered = words.filter(w => w.status === 'mastered');
        // Mix: 80% learning, 20% review
        setStudySet([...learning, ...mastered.slice(0, 2)]);
    }, []); // Run once on mount

    const currentWord = studySet[currentIndex];

    // Auto-play audio when word changes
    useEffect(() => {
        if (currentWord) {
            playAudio(currentWord.term);
        }
    }, [currentWord]);

    const playAudio = (text: string) => {
        window.speechSynthesis.cancel(); // Cancel potential previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const handleNext = (isKnown: boolean) => {
        if (!currentWord) return;

        updateWordStatus(currentWord.id, isKnown);

        // Ensure we reset flip state before moving, but since we removed isFlipped dependency
        // from the audio effect, we won't get the double-play bug.
        setIsFlipped(false);

        if (currentIndex < studySet.length - 1) {
            setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
        } else {
            alert('오늘의 학습 완료! 🎉');
            navigate('/');
        }
    };

    if (!currentWord) return <div className="p-8 text-center text-slate-500">학습할 단어가 준비중입니다...</div>;

    const progress = ((currentIndex + 1) / studySet.length) * 100;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400">
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="flex-1 mx-6">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="text-xs font-bold text-slate-400 font-mono">
                    {currentIndex + 1} / {studySet.length}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full min-h-0">
                <Flashcard
                    front={
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">{currentWord.term}</h2>
                            <button
                                onClick={(e) => { e.stopPropagation(); playAudio(currentWord.term); }}
                                className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors inline-block"
                            >
                                <Volume2 className="w-6 h-6" />
                            </button>
                            {currentWord.ipa && <p className="text-slate-400 font-mono">{currentWord.ipa}</p>}
                        </div>
                    }
                    back={
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">{currentWord.definition}</h3>
                                {currentWord.example && (
                                    <p className="text-slate-500 italic">"{currentWord.example}"</p>
                                )}
                            </div>
                        </div>
                    }
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                />
            </div>

            {/* Controls - Always visible now */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4 mt-4 pb-2 flex-shrink-0"
            >
                <button
                    onClick={() => handleNext(false)}
                    className="p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold text-lg hover:bg-rose-100 transition-colors shadow-sm flex flex-col items-center gap-1"
                >
                    <X className="w-6 h-6" />
                    <span>몰라요 😅</span>
                </button>
                <button
                    onClick={() => handleNext(true)}
                    className="p-4 rounded-2xl bg-green-50 text-green-600 font-bold text-lg hover:bg-green-100 transition-colors shadow-sm flex flex-col items-center gap-1"
                >
                    <Check className="w-6 h-6" />
                    <span>알아요 🤩</span>
                </button>
            </motion.div>
        </div>
    );
};
