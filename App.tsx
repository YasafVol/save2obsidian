import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { MarkdownPreview } from './components/MarkdownPreview';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { GeneratedNoteData } from './types';
import { generateObsidianNote } from './services/geminiService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState<string>('');

  const formatMarkdown = (data: GeneratedNoteData, url: string, channelName: string): string => {
    const today = new Date().toISOString().split('T')[0];
    const tags = data.tags.join(', ');

    return `---
date: ${today}
source: ${url}
creator: "${channelName}"
tags: [${tags}]
---

# ${data.title}

## TLDR
${data.tldr}

## Summary
${data.summary}

## Full Text
${data.fullText}

## References
${data.references}
`;
  };

  const handleGenerate = useCallback(async (url: string) => {
    if (!url) {
      setError('Please provide a YouTube URL.');
      return;
    }
    
    // Simple URL validation
    try {
      new URL(url);
    } catch (_) {
      setError('Please enter a valid YouTube URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMarkdownContent('');
    setNoteTitle('');

    try {
      // 1. Fetch channel name from YouTube oEmbed API
      // Using a CORS proxy to avoid browser-side CORS issues. A more robust solution would be a dedicated backend.
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const oembedResponse = await fetch(oembedUrl);

      if (!oembedResponse.ok) {
        throw new Error('Could not fetch video details. Please check the URL and ensure the video is public.');
      }
      
      const videoData = await oembedResponse.json();
      const channelName = videoData.author_name;

      if (!channelName) {
        throw new Error('Could not automatically determine the channel name from the video URL.');
      }
      
      // 2. Generate the note with the fetched channel name
      const noteData = await generateObsidianNote(url, channelName);
      if (noteData) {
        const formatted = formatMarkdown(noteData, url, channelName);
        setMarkdownContent(formatted);
        setNoteTitle(noteData.title);
      } else {
        throw new Error('Received no data from the AI model.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              Obsidian Note Generator
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Paste a YouTube link to instantly generate a structured, Obsidian-ready Markdown note with summaries, tags, and more.
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-center">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="mt-8 flex justify-center">
              <Loader />
            </div>
          )}

          {markdownContent && !isLoading && (
            <div className="mt-8">
              <MarkdownPreview 
                content={markdownContent} 
                title={noteTitle}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;