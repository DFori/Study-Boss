import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface StudyMaterial {
  summary: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  flashcards: {
    front: string;
    back: string;
  }[];
}

export async function generateStudyMaterial(notes: string): Promise<StudyMaterial> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Given the following study notes, generate a summary, 5 multiple choice questions, and 3 flashcards.
    
    Notes:
    ${notes}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A concise summary (max 100 words)" },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
                correctAnswer: { type: Type.NUMBER, description: "Index of correct answer (0-3)" }
              },
              required: ["question", "options", "correctAnswer"]
            }
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        },
        required: ["summary", "questions", "flashcards"]
      }
    }
  });

  return JSON.parse(response.text);
}
