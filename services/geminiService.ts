
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedNoteData } from '../types';
import { createPrompt } from './prompt';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { 
      type: Type.STRING,
      description: "A concise and descriptive title for the note, summarizing the video's core topic. Must not contain invalid filename characters."
    },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "A list of 3 to 7 relevant tags (as an array of strings) that categorize the video content. Tags must be single words (use camelCase or kebab-case for multiple words) and not include the '#' prefix."
    },
    tldr: { 
      type: Type.STRING,
      description: "A 'Too Long; Didn't Read' summary in 2-3 bullet points. Format as a single string with markdown bullet points (e.g., '- Point one\\n- Point two')."
    },
    summary: { 
      type: Type.STRING,
      description: "A detailed, one-paragraph summary of the video."
    },
    fullText: { 
      type: Type.STRING,
      description: "An extended, comprehensive summary of the video's content, broken into multiple paragraphs if necessary."
    },
    references: { 
      type: Type.STRING,
      description: "A list of potential sources, books, or articles that are likely referenced or relevant to the video's content. Format as a single string with markdown bullet points. If no specific sources are mentioned, infer some logical ones based on the topic."
    },
  },
  required: ['title', 'tags', 'tldr', 'summary', 'fullText', 'references']
};

export async function generateObsidianNote(videoUrl: string, channelName: string): Promise<GeneratedNoteData> {
  const prompt = createPrompt(videoUrl, channelName);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("API returned an empty response.");
    }

    // The response text should already be a JSON string due to responseMimeType
    const parsedData = JSON.parse(text);

    // Basic validation
    if (!parsedData.title || !Array.isArray(parsedData.tags)) {
      throw new Error("API response is missing required fields.");
    }
    
    return parsedData as GeneratedNoteData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate note from Gemini API. Check the console for details.");
  }
}
