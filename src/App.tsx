import React, { useState, useEffect } from 'react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { Login } from '@/src/components/Login';
import { TopicCreator } from '@/src/components/TopicCreator';
import { Quiz } from '@/src/components/Quiz';
import { Flashcards } from '@/src/components/Flashcards';
import { calculateLevel, getProgress, updateStreak } from '@/src/lib/gamify';
import { UserStats, Topic } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Flame as Fire, 
  Zap, 
  BookOpen, 
  Plus, 
  LogOut, 
  BrainCircuit, 
  History,
  ChevronRight,
  GraduationCap,
  Layers,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'quiz' | 'flashcards'>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Initialize or fetch user stats
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const initialStats: UserStats = {
            uid: u.uid,
            email: u.email || '',
            xp: 0,
            level: 1,
            streak: 0,
            lastActiveDate: serverTimestamp()
          };
          await setDoc(userRef, initialStats);
          setStats(initialStats);
        } else {
          const data = userSnap.data() as UserStats;
          setStats(data);
          
          // Check streak
          const streakUpdate = updateStreak(data.lastActiveDate);
          if (streakUpdate.increment || streakUpdate.reset) {
            await updateDoc(userRef, {
              streak: streakUpdate.reset ? 1 : (data.streak + 1),
              lastActiveDate: serverTimestamp()
            });
          }
        }

        // Listen for topics
        const q = query(collection(db, 'topics'), where('userId', '==', u.uid));
        const unsubTopics = onSnapshot(q, (snapshot) => {
          const tList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
          setTopics(tList.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        });

        // Listen for stats updates
        const unsubStats = onSnapshot(userRef, (doc) => {
          if (doc.exists()) setStats(doc.data() as UserStats);
        });

        return () => {
          unsubTopics();
          unsubStats();
        };
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleQuizComplete = async (score: number) => {
    if (!user || !stats || !selectedTopic) return;
    
    const xpEarned = score * 20;
    const newXp = stats.xp + xpEarned;
    const oldLevel = calculateLevel(stats.xp);
    const newLevel = calculateLevel(newXp);

    if (newLevel > oldLevel) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      xp: newXp,
      level: newLevel,
      lastActiveDate: serverTimestamp()
    });

    await addDoc(collection(db, 'attempts'), {
      userId: user.uid,
      topicId: selectedTopic.id,
      score,
      total: selectedTopic.questions.length,
      xpEarned,
      date: serverTimestamp()
    });
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Zap className="w-8 h-8 text-indigo-500 animate-pulse" /></div>;
  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">StudyBoss</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 leading-none">Level {stats?.level}</span>
                <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${getProgress(stats?.xp || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Fire className="w-5 h-5 text-orange-500" />
              <span className="font-bold">{stats?.streak}</span>
            </div>

            <Button variant="ghost" size="icon" onClick={() => auth.signOut()} className="text-zinc-500 hover:text-white">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Welcome back, Boss.</h1>
                  <p className="text-zinc-400">Ready to crush some study goals today?</p>
                </div>
                <Button 
                  onClick={() => setActiveView('create')}
                  className="bg-indigo-600 hover:bg-indigo-500 h-12 px-6 rounded-xl font-bold shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Topic
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      Your Study Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topics.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                        <BrainCircuit className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">No topics yet. Create one to start learning!</p>
                      </div>
                    ) : (
                      topics.map((topic) => (
                        <div 
                          key={topic.id}
                          className="group p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-indigo-500 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{topic.title}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">{topic.questions.length} Questions</Badge>
                                <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">{topic.flashcards.length} Flashcards</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Summary
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                  <DialogHeader>
                                    <DialogTitle>{topic.title} - Summary</DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4 text-zinc-300 leading-relaxed">
                                    {topic.summary}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedTopic(topic);
                                  setActiveView('flashcards');
                                }}
                                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                              >
                                <Layers className="w-4 h-4 mr-2" />
                                Flashcards
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedTopic(topic);
                                  setActiveView('quiz');
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500"
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Quiz
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-sm uppercase tracking-widest text-zinc-500 font-bold">Daily Challenge</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                          <Fire className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-bold">Complete 1 Quiz</p>
                          <p className="text-xs text-zinc-500">Earn 50 bonus XP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-400" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-zinc-500">
                      Coming soon: Detailed progress tracking and leaderboard!
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-6">
                <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="text-zinc-400 hover:text-white">
                  ← Back to Dashboard
                </Button>
              </div>
              <TopicCreator userId={user.uid} onSuccess={() => setActiveView('dashboard')} />
            </motion.div>
          )}

          {activeView === 'quiz' && selectedTopic && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Quiz 
                questions={selectedTopic.questions} 
                onComplete={handleQuizComplete}
                onClose={() => setActiveView('dashboard')}
              />
            </motion.div>
          )}

          {activeView === 'flashcards' && selectedTopic && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Flashcards 
                cards={selectedTopic.flashcards} 
                onClose={() => setActiveView('dashboard')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
