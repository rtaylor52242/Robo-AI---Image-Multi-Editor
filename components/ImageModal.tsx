
import React, { useEffect } from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ImageModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    const sanitizedPrompt = image.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `variation_${sanitizedPrompt.slice(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-prompt"
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 relative max-w-4xl w-full max-h-[90vh] flex flex-col gap-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.imageUrl}
          alt={image.prompt}
          className="w-full h-auto object-contain flex-1 min-h-0 rounded-lg"
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p id="image-modal-prompt" className="text-gray-300 text-center sm:text-left flex-1">{image.prompt}</p>
            <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors w-full sm:w-auto"
            >
                <DownloadIcon className="w-5 h-5" />
                <span>Download</span>
            </button>
        </div>
        <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-gray-700 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
            aria-label="Close image viewer"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
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
