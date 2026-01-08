import React from 'react';
import { BookOpen, MessageCircle, Home, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative">
            <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="font-exbold text-lg text-slate-800 tracking-tight">EngMaster</span>
                </div>
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <Settings className="w-5 h-5 text-slate-400" />
                </button>
            </header>

            <main className="flex-1 w-full px-6 py-4 overflow-y-auto overscroll-contain pb-24">
                {children}
            </main>

            <nav className="fixed bottom-6 left-0 right-0 px-6 z-20 max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl h-16 flex items-center justify-around px-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full h-full rounded-2xl transition-all duration-300 ${isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`
                        }
                    >
                        <Home className="w-6 h-6 stroke-[2.5px]" />
                        <span className="text-[10px] font-bold mt-0.5">홈</span>
                    </NavLink>

                    <div className="w-px h-8 bg-slate-100" />

                    <NavLink
                        to="/conversation"
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full h-full rounded-2xl transition-all duration-300 ${isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`
                        }
                    >
                        <MessageCircle className="w-6 h-6 stroke-[2.5px]" />
                        <span className="text-[10px] font-bold mt-0.5">회화</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};
