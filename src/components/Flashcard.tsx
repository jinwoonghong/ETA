import React from 'react';
import { motion } from 'framer-motion';

interface FlashcardProps {
    front: React.ReactNode;
    back: React.ReactNode;
    isFlipped: boolean;
    onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ front, back, isFlipped, onFlip }) => {
    return (
        <div className="w-full h-[420px] perspective-1000" onClick={onFlip}>
            <motion.div
                className="relative w-full h-full preserve-3d cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col items-center justify-center p-8 text-center ring-1 ring-black/5">
                    {front}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <span className="text-xs font-medium text-slate-300 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">Touch to Flip</span>
                    </div>
                </div>

                {/* Back */}
                <div
                    className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] border border-indigo-100 flex flex-col items-center justify-center p-8 text-center ring-1 ring-indigo-100"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
};
