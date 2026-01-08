import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { Download, Upload, RotateCcw, ArrowLeft, FileJson, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { read, utils, writeFile } from 'xlsx';
import type { Word, Sentence } from '../types';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { words, sentences, importData, resetProgress } = useStore();
    const jsonInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    const handleExportJson = () => {
        const data = {
            words,
            sentences,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `english-learning-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                if (confirm(`단어 ${json.words?.length || 0}개, 문장 ${json.sentences?.length || 0}개를 가져오시겠습니까?`)) {
                    importData({
                        words: Array.isArray(json.words) ? json.words : [],
                        sentences: Array.isArray(json.sentences) ? json.sentences : []
                    });
                    alert('데이터 가져오기 완료! 🎉');
                    navigate('/');
                }
            } catch (error) {
                alert('JSON 파일 읽기 오류');
            }
        };
        reader.readAsText(file);
        if (jsonInputRef.current) jsonInputRef.current.value = '';
    };

    const handleDownloadExcelTemplate = () => {
        const wordHeaders = ['term', 'definition', 'example', 'ipa'];
        const sentenceHeaders = ['pattern', 'original', 'translation', 'situation'];

        const wb = utils.book_new();

        // Words Sheet
        const wsWords = utils.aoa_to_sheet([wordHeaders]);
        utils.book_append_sheet(wb, wsWords, "Words");

        // Sentences Sheet
        const wsSentences = utils.aoa_to_sheet([sentenceHeaders]);
        utils.book_append_sheet(wb, wsSentences, "Sentences");

        writeFile(wb, "english-learning-template.xlsx");
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const wb = read(data, { type: 'binary' });

                const newWords: Word[] = [];
                const newSentences: Sentence[] = [];

                if (wb.SheetNames.includes("Words")) {
                    const rows = utils.sheet_to_json<any>(wb.Sheets["Words"]);
                    rows.forEach((row) => {
                        if (row.term && row.definition) {
                            newWords.push({
                                id: `excel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                term: row.term,
                                definition: row.definition,
                                example: row.example || '',
                                ipa: row.ipa || '',
                                status: 'new',
                                nextReviewDate: null,
                                reviewCount: 0
                            });
                        }
                    });
                }

                if (wb.SheetNames.includes("Sentences")) {
                    const rows = utils.sheet_to_json<any>(wb.Sheets["Sentences"]);
                    rows.forEach((row) => {
                        if (row.original && row.translation) {
                            newSentences.push({
                                id: `excel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                pattern: row.pattern || 'Etc',
                                original: row.original,
                                translation: row.translation,
                                situation: row.situation || '',
                                status: 'new',
                                nextReviewDate: null,
                                reviewCount: 0
                            });
                        }
                    });
                }

                if (newWords.length === 0 && newSentences.length === 0) {
                    alert('가져올 데이터가 없습니다. 엑셀 시트 이름(Words, Sentences)과 헤더를 확인해주세요.');
                    return;
                }

                if (confirm(`엑셀에서 단어 ${newWords.length}개, 문장 ${newSentences.length}개를 가져오시겠습니까?`)) {
                    importData({ words: newWords, sentences: newSentences });
                    alert('엑셀 데이터 가져오기 완료! 🎉');
                    navigate('/');
                }

            } catch (error) {
                console.error(error);
                alert('엑셀 파일 처리 중 오류가 발생했습니다.');
            }
        };
        reader.readAsBinaryString(file);
        if (excelInputRef.current) excelInputRef.current.value = '';
    };

    const handleReset = () => {
        if (confirm('정말로 모든 학습 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            resetProgress();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">설정 및 데이터 관리</h1>
            </div>

            <div className="space-y-6 overflow-y-auto pb-8 scrollbar-hide">
                {/* Excel Section (Priority) */}
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-white text-emerald-600 shadow-sm">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">엑셀 쉽고 편하게</h2>
                            <p className="text-sm text-slate-500">엑셀로 정리해서 한 번에 올리세요!</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleDownloadExcelTemplate}
                            className="py-3 rounded-xl bg-white text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors text-sm"
                        >
                            양식 다운로드
                        </button>
                        <button
                            onClick={() => excelInputRef.current?.click()}
                            className="py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-emerald-200 shadow-md text-sm"
                        >
                            엑셀 파일 업로드
                        </button>
                    </div>
                    <input
                        type="file"
                        ref={excelInputRef}
                        accept=".xlsx, .xls"
                        onChange={handleImportExcel}
                        className="hidden"
                    />
                </div>

                {/* JSON Section */}
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-slate-100 text-slate-600">
                            <FileJson className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">백업 및 복원 (JSON)</h2>
                            <p className="text-sm text-slate-500">전체 데이터를 안전하게 보관하세요</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleExportJson}
                            className="py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Download className="w-4 h-4" />
                            백업 받기
                        </button>
                        <button
                            onClick={() => jsonInputRef.current?.click()}
                            className="py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Upload className="w-4 h-4" />
                            복원하기
                        </button>
                    </div>
                    <input
                        type="file"
                        ref={jsonInputRef}
                        accept=".json"
                        onChange={handleImportJson}
                        className="hidden"
                    />
                </div>

                {/* Reset Section */}
                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-white text-rose-500 shadow-sm">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">초기화</h2>
                            <p className="text-sm text-slate-500">모든 학습 데이터를 삭제합니다</p>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <AlertCircle className="w-5 h-5" />
                        전체 초기화
                    </button>
                </div>
            </div>
        </div>
    );
};
