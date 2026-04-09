import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateStudyMaterial } from '@/src/lib/gemini';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface TopicCreatorProps {
  userId: string;
  onSuccess: () => void;
}

export const TopicCreator: React.FC<TopicCreatorProps> = ({ userId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !notes) return;
    setLoading(true);
    try {
      const material = await generateStudyMaterial(notes);
      await addDoc(collection(db, 'topics'), {
        userId,
        title,
        content: notes,
        ...material,
        createdAt: serverTimestamp()
      });
      setTitle('');
      setNotes('');
      onSuccess();
    } catch (error) {
      console.error("Error creating topic:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Create New Study Topic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Topic Title</label>
          <Input 
            placeholder="e.g. Biology - Photosynthesis" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Learning Material / Notes</label>
          <Textarea 
            placeholder="Paste your lecture notes, textbook snippets, or any text you want to study..." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-zinc-800 border-zinc-700 min-h-[200px]"
          />
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={loading || !title || !notes}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-lg font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI is processing...
            </>
          ) : (
            "Generate Study Pack"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
