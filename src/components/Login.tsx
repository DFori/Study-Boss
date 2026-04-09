import React from 'react';
import { auth, googleProvider } from '@/src/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-center">
        <CardHeader className="space-y-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">StudyBoss AI</CardTitle>
            <CardDescription className="text-zinc-400">
              Level up your learning with AI-powered gamification.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Button 
            onClick={handleLogin} 
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 py-6 text-lg font-bold flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </Button>
          <p className="text-xs text-zinc-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
