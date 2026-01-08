import { useState, useEffect, useRef } from 'react';
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
    const [transcript, setTranscript] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (patternId) {
            setStudySet(sentences.filter(s => s.pattern === patternId));
        }
    }, [patternId, sentences]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(finalTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsSpeaking(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

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
            setTranscript('');
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

    const handleRecordingToggle = () => {
        if (isSpeaking) {
            // Stop recording
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsSpeaking(false);
            setMode('result');
            playAudio(currentSentence.original);
        } else {
            // Start recording
            setTranscript('');
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    setIsSpeaking(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
                // Fallback for non-supported browsers
                setIsSpeaking(true);
            }
        }
    };

    if (!currentSentence && mode !== 'summary') return <div className="p-8 text-center text-slate-500">Loading...</div>;

    const progress = ((currentIndex + 1) / studySet.length) * 100;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
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

            <div className="flex-1 flex flex-col relative w-full max-w-sm mx-auto min-h-0">
                <AnimatePresence mode="wait">
                    {mode === 'listen' && (
                        <motion.div
                            key="listen"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full h-full flex flex-col"
                        >
                            <div className="flex-shrink-0 text-center mb-4">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                                    Step 1: Listen & Shadow
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center min-h-0 space-y-4 py-2 overflow-y-auto">
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug text-center">{currentSentence.original}</h2>
                                <p className="text-base sm:text-lg text-slate-500 font-medium text-center">{currentSentence.translation}</p>

                                <button
                                    onClick={() => playAudio(currentSentence.original)}
                                    className="mt-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
                                >
                                    <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
                                </button>
                            </div>

                            <div className="flex-shrink-0 pt-4 pb-2">
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
                            className="w-full h-full flex flex-col"
                        >
                            <div className="flex-shrink-0 text-center mb-4">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                                    Step 2: Speak It
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
                                <div className="w-full space-y-4 text-center">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug px-2">{currentSentence.translation}</h2>
                                    <p className="text-slate-400 text-sm">위 문장을 영어로 말해보세요</p>
                                </div>

                                <div className="mt-8 mb-4 w-full flex flex-col items-center">
                                    <button
                                        onClick={handleRecordingToggle}
                                        className={`p-6 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-red-500 scale-110 shadow-red-200 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                            } text-white shadow-lg`}
                                    >
                                        <Mic className="w-8 h-8" />
                                    </button>
                                    <div className="mt-4 min-h-[3rem] px-4 w-full text-center">
                                        {isSpeaking ? (
                                            <p className="text-lg font-medium text-indigo-600 animate-pulse break-words">
                                                {transcript || "듣고 있습니다..."}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-slate-500 font-medium">터치하여 말하기 시작</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0 text-center pb-2">
                                <button
                                    onClick={() => setMode('result')}
                                    className="text-slate-400 text-sm underline hover:text-slate-600 p-2"
                                >
                                    정답 확인 (건너뛰기)
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full h-full flex flex-col"
                        >
                            <div className="flex-shrink-0 text-center mb-4">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider">
                                    Check Answer
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 w-full">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">{currentSentence.original}</h2>
                                    <p className="text-slate-500">{currentSentence.translation}</p>
                                    {transcript && (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <p className="text-xs text-slate-400 mb-1">내가 말한 내용</p>
                                            <p className="text-indigo-600 font-medium break-words">{transcript}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center gap-4 mt-6">
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
                            </div>

                            <div className="flex-shrink-0 pt-4 pb-2">
                                <button
                                    onClick={handleNext}
                                    className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    완벽해요 (다음)
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full h-full flex flex-col"
                        >
                            <div className="flex-shrink-0 mb-4">
                                <h2 className="text-2xl font-bold text-slate-800 text-center">오늘의 학습 요약</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-hide min-h-0">
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

                            <div className="flex-shrink-0 pt-4 pb-2">
                                <button
                                    onClick={() => navigate('/conversation')}
                                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-colors"
                                >
                                    학습 마치기
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
