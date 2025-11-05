import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-indigo-600 dark:text-indigo-200 text-sm">Generating...</p>
    </div>
  );
};