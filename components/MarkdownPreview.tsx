import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { ObsidianIcon } from './icons/ObsidianIcon';

interface MarkdownPreviewProps {
  content: string;
  title: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, title }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyStatus('copied');
    });
  };

  useEffect(() => {
    if (copyStatus === 'copied') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);
  
  const obsidianUrl = `obsidian://new?name=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Generated Note</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-md transition-colors"
            >
              <CopyIcon className="w-4 h-4" />
              {copyStatus === 'idle' ? 'Copy' : 'Copied!'}
            </button>
            <a
              href={obsidianUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <ObsidianIcon className="w-4 h-4" />
              Open in Obsidian
            </a>
          </div>
        </div>
        <textarea
          readOnly
          value={content}
          className="w-full h-96 bg-gray-900/70 border border-gray-700 rounded-md p-4 font-mono text-sm text-gray-300 focus:ring-0 focus:outline-none"
          aria-label="Generated Markdown Content"
        />
      </div>
    </div>
  );
};