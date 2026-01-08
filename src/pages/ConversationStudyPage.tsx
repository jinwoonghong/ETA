import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Mic, Volume2, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { Sentence } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const ConversationStudyPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patternId = searchParams.get('pattern');
    const { sentences } = useStore();

    const [studySet, setStudySet] = useState<Sentence[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState<'listen' | 'speak' | 'result' | 'summary'>('listen');
    const [isSpeaking, setIsSpeaking] = useState(false);
    // Track which items are expanded in summary mode
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (patternId) {
            setStudySet(sentences.filter(s => s.pattern === patternId));
        }
    }, [patternId, sentences]);

    const currentSentence = studySet[currentIndex];

    // Auto-play on Listen mode
    useEffect(() => {
        if (currentSentence && mode === 'listen') {
            const timer = setTimeout(() => {
                playAudio(currentSentence.original);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentSentence, mode]);

    const playAudio = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const handleNext = () => {
        if (currentIndex < studySet.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setMode('listen');
        } else {
            setMode('summary');
        }
    };

    const toggleSummaryItem = (id: string, text: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
            playAudio(text);
        }
        setExpandedIds(newSet);
    };

    const simulateRecording = () => {
        setIsSpeaking(true);
        setTimeout(() => {
            setIsSpeaking(false);
            setMode('result');
            playAudio(currentSentence.original); // Play answer automatically
        }, 1500);
    };

    if (!currentSentence && mode !== 'summary') return <div className="p-8 text-center text-slate-500">Loading...</div>;

    const progress = ((currentIndex + 1) / studySet.length) * 100;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/conversation')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400">
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="flex-1 mx-6">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500 rounded-full"
                            initial={{ width: mode === 'summary' ? '100%' : `${progress}%` }}
                            animate={{ width: mode === 'summary' ? '100%' : `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="text-xs font-bold text-slate-400 font-mono">
                    {mode === 'summary' ? 'Done' : `${currentIndex + 1} / ${studySet.length}`}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
                <AnimatePresence mode="wait">
                    {mode === 'listen' && (
                        <motion.div
                            key="listen"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-8 text-center"
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                                Step 1: Listen & Shadow
                            </span>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-slate-800 leading-snug">{currentSentence.original}</h2>
                                <p className="text-lg text-slate-500 font-medium">{currentSentence.translation}</p>
                            </div>

                            <button
                                onClick={() => playAudio(currentSentence.original)}
                                className="w-20 h-20 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                <Volume2 className="w-8 h-8" />
                            </button>

                            <div className="pt-8">
                                <button
                                    onClick={() => setMode('speak')}
                                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-colors"
                                >
                                    다음: 퀴즈 풀기
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'speak' && (
                        <motion.div
                            key="speak"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-8 text-center"
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                                Step 2: Speak It
                            </span>

                            <div className="space-y-4">
                                <div className="h-32 flex items-center justify-center">
                                    <h2 className="text-2xl font-bold text-slate-800 leading-snug">{currentSentence.translation}</h2>
                                </div>
                                <p className="text-slate-400 text-sm">위 문장을 영어로 말해보세요</p>
                            </div>

                            <div className="py-2">
                                <button
                                    onClick={simulateRecording}
                                    disabled={isSpeaking}
                                    className={`p-6 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                        } text-white shadow-lg`}
                                >
                                    <Mic className="w-8 h-8" />
                                </button>
                                <p className="mt-4 text-sm text-slate-500 font-medium">
                                    {isSpeaking ? '듣고 있습니다...' : '터치하여 말하기'}
                                </p>
                            </div>

                            <button
                                onClick={() => setMode('result')}
                                className="text-slate-400 text-sm underline hover:text-slate-600"
                            >
                                정답 확인 (건너뛰기)
                            </button>
                        </motion.div>
                    )}

                    {mode === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-8 text-center"
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider">
                                Check Answer
                            </span>

                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentSentence.original}</h2>
                                <p className="text-slate-500">{currentSentence.translation}</p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => playAudio(currentSentence.original)}
                                    className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setMode('speak')}
                                    className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                </button>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                완벽해요 (다음)
                            </button>
                        </motion.div>
                    )}

                    {mode === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full flex-1 flex flex-col"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">오늘의 학습 요약</h2>

                            <div className="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
                                {studySet.map((sentence, idx) => (
                                    <div
                                        key={sentence.id}
                                        onClick={() => toggleSummaryItem(sentence.id, sentence.original)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${expandedIds.has(sentence.id)
                                                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                                : 'bg-white border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1 text-left">
                                                <p className="text-slate-700 font-medium">{sentence.translation}</p>
                                                {expandedIds.has(sentence.id) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-2 text-indigo-700 font-bold"
                                                    >
                                                        {sentence.original}
                                                    </motion.div>
                                                )}
                                            </div>
                                            {expandedIds.has(sentence.id) && <Volume2 className="w-5 h-5 text-indigo-400" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/conversation')}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-colors mt-4"
                            >
                                학습 마치기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
