import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PlayCircle } from 'lucide-react';

export const ConversationPage = () => {
    const { sentences } = useStore();
    const navigate = useNavigate();

    // Group sentences by pattern
    const patterns = Array.from(new Set(sentences.map(s => s.pattern)));

    return (
        <div className="space-y-6 pb-20">
            <header className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">생활 영어 회화</h2>
                <p className="text-slate-500">핵심 패턴 233개로 마스터하는 실전 영어</p>
            </header>

            <div className="grid gap-4">
                {patterns.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        데이터가 없습니다.
                    </div>
                ) : (
                    patterns.map((pattern, idx) => {
                        const count = sentences.filter(s => s.pattern === pattern).length;
                        return (
                            <button
                                key={idx}
                                onClick={() => navigate(`/study/conversation?pattern=${encodeURIComponent(pattern)}`)}
                                className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-indigo-600 mb-1">{pattern}</h3>
                                    <p className="text-xs text-slate-400">{count} 문장 포함</p>
                                </div>
                                <PlayCircle className="w-8 h-8 text-indigo-200" />
                            </button>
                        )
                    })
                )}
            </div>

            <div className="mt-8 bg-indigo-50 p-6 rounded-2xl">
                <h3 className="font-bold text-indigo-800 mb-2">학습 팁</h3>
                <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside opacity-80">
                    <li>원어민 음성을 듣고 큰 소리로 따라하세요.</li>
                    <li>한글만 보고 영어가 튀어나올 때까지 반복하세요.</li>
                </ul>
            </div>
        </div>
    );
}
