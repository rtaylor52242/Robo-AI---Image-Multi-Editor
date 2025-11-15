import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { UploadIcon } from './icons/UploadIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="help-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                How to Use the App
            </h2>
            <button
                onClick={onClose}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label="Close help guide"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto mt-4 pr-2 space-y-6 text-gray-600 dark:text-gray-300">
            <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2"><UploadIcon className="w-5 h-5 text-indigo-500" />1. Upload a Base Image</h3>
                <p>Click or drag-and-drop your ad creative into the "Base Image" box. This is the starting point for all your variations.</p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2"><PlusIcon className="w-5 h-5 text-indigo-500" />2. Add Edit Prompts</h3>
                <p>Type a change you want to see in the input box (e.g., "change background to a beach") and click the plus button or press Enter. You can add multiple prompts to generate several variations at once.</p>
                <p className="text-sm p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <strong>Tip:</strong> Be descriptive! The AI will try its best to preserve text, logos, and the main subject, so focus your prompt on the change you want.
                </p>
            </div>

             <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-indigo-500" />3. Adjust Settings & Generate</h3>
                <p>Optionally, you can set a brand color, add a texture, and choose an export aspect ratio (like for an Instagram Story). When you're ready, click the "Generate Variations" button.</p>
            </div>

            <div className="space-y-3">
                 <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2"><MagicWandIcon className="w-5 h-5 text-indigo-500" />4. Post-Editing & Downloads</h3>
                 <p>Once your images are generated, hover over any successful result to see action buttons. You can:</p>
                 <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Remove Background:</strong> Creates a new version of the image with a transparent background.</li>
                    <li><strong>Share:</strong> Use the native share option on your device.</li>
                    <li><strong>Download:</strong> Save a single image.</li>
                 </ul>
                 <p>Use the <strong className="inline-flex items-center gap-1"><DownloadIcon className="w-4 h-4" />Download All</strong> button at the top of the results area to get a ZIP file of all successful images.</p>
            </div>
        </main>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};
