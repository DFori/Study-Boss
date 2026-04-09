import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Flashcard } from '@/src/types';

interface FlashcardsProps {
  cards: Flashcard[];
  onClose: () => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ cards, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((currentIdx + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((currentIdx - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Flashcards</h2>
        <Button variant="ghost" onClick={onClose}>Exit</Button>
      </div>

      <div className="perspective-1000 h-80 relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx + (isFlipped ? '-back' : '-front')}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Card className="w-full h-full bg-zinc-900 border-zinc-800 flex items-center justify-center p-8 text-center shadow-xl">
              <CardContent className="p-0">
                <p className="text-2xl font-medium leading-relaxed">
                  {isFlipped ? cards[currentIdx].back : cards[currentIdx].front}
                </p>
                <p className="text-zinc-500 text-sm mt-8 uppercase tracking-widest font-bold">
                  {isFlipped ? "Answer" : "Question"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-6">
        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); prevCard(); }} className="rounded-full w-12 h-12">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <span className="text-zinc-400 font-mono">
          {currentIdx + 1} / {cards.length}
        </span>
        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); nextCard(); }} className="rounded-full w-12 h-12">
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      <div className="text-center text-zinc-500 text-sm">
        Click the card to flip
      </div>
    </div>
  );
};
