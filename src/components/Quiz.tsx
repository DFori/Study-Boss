import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from '@/src/types';

interface QuizProps {
  questions: Question[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    
    if (idx === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (score + (selectedAnswer === questions[currentIdx].correctAnswer ? 1 : 0) >= questions.length * 0.8) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      onComplete(score);
    }
  };

  if (showResult) {
    return (
      <Card className="w-full max-w-lg mx-auto bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-white">
            {score} / {questions.length}
          </div>
          <p className="text-zinc-400">
            You earned <span className="text-indigo-400 font-bold">{score * 20} XP</span>
          </p>
          <Button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-500">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const q = questions[currentIdx];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-500 hover:text-white">
            Exit
          </Button>
        </div>
        <CardTitle className="text-xl leading-relaxed">{q.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctAnswer;
          const isSelected = i === selectedAnswer;
          
          let variant = "outline";
          let className = "w-full text-left justify-start h-auto py-4 px-6 text-base border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 transition-all";
          
          if (isAnswered) {
            if (isCorrect) {
              className += " bg-green-900/30 border-green-500 text-green-100";
            } else if (isSelected) {
              className += " bg-red-900/30 border-red-500 text-red-100";
            } else {
              className += " opacity-50";
            }
          }

          return (
            <Button
              key={i}
              variant="outline"
              className={className}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
            >
              <div className="flex items-center w-full">
                <span className="flex-1">{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 ml-2" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-2" />}
              </div>
            </Button>
          );
        })}

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4"
            >
              <Button onClick={nextQuestion} className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-lg font-bold">
                {currentIdx + 1 === questions.length ? "Finish Quiz" : "Next Question"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
