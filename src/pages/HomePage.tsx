import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Play, Zap, Trophy, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HomePage = () => {
    const { words, stats, initializeData } = useStore();

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    const progress = Math.min(100, (stats.masteredWords / (stats.totalWords || 1)) * 100);

    return (
        <div className="space-y-8">
            {/* Hero Stats Card */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-7 text-white shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-32 h-32 rotate-12" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-semibold tracking-wide uppercase">Total Mastery</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-5xl font-bold tracking-tight">{stats.masteredWords}</span>
                        <span className="text-indigo-200 font-medium">words</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-indigo-200">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Actions */}
            <div className="grid grid-cols-2 gap-4">
                <NavLink to="/study/words" className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 z-10 shadow-sm">
                        <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div className="z-10">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">단어 학습<br />시작하기</h3>
                        <p className="text-xs text-slate-400">오늘의 단어 암기</p>
                    </div>
                </NavLink>

                <NavLink to="/conversation" className="group relative overflow-hidden bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 z-10 shadow-sm">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div className="z-10">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">실전 회화<br />도전하기</h3>
                        <p className="text-xs text-slate-400">패턴으로 말하기</p>
                    </div>
                </NavLink>
            </div>

            {/* Recent List */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-slate-800">최근 단어</h3>
                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full">
                        전체보기 <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="space-y-3">
                    {words.slice(0, 5).map((word, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={word.id}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-bold text-slate-800">{word.term}</span>
                                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter px-1.5 py-0.5 bg-slate-100 rounded">
                                        {word.ipa || 'IPA'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-1">{word.definition}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${word.status === 'new' ? 'bg-blue-50 text-blue-600' :
                                    word.status === 'learning' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                                }`}>
                                {word.status === 'new' ? 'NEW' : word.status === 'learning' ? 'ING' : 'DONE'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};
