
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div 
          className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-purple-500 border-t-transparent"
          role="status"
          aria-live="polite"
        >
             <span className="sr-only">Loading...</span>
        </div>
        <p className="text-gray-400">Gemini is thinking...</p>
    </div>
  );
};
