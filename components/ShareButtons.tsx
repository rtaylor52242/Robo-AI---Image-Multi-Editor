import React from 'react';
import { ShareIcon } from './icons/ShareIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { EmailIcon } from './icons/EmailIcon';

export const ShareButtons: React.FC = () => {
  const appUrl = window.location.href;
  const shareText = "Check out Robo AI - Image Multi-Editor! I'm using it to generate awesome ad variations in seconds. You should try it!";
  const encodedShareText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(appUrl);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Robo AI - Image Multi-Editor',
          text: shareText,
          url: appUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };
  
  // Check if navigator and navigator.share are available
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;


  if (canNativeShare) {
    return (
      <button 
        onClick={handleNativeShare} 
        className="flex items-center gap-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <ShareIcon className="w-5 h-5" />
        <span>Share App</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Share App:</span>
      <a 
        href={`https://wa.me/?text=${encodedShareText}%20${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Share on WhatsApp"
      >
        <WhatsAppIcon className="w-6 h-6" />
      </a>
      <a 
        href={`mailto:?subject=Check%20out%20Robo%20AI%20-%20Image%20Multi-Editor&body=${encodedShareText}%0A%0A${encodedUrl}`}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Share via Email"
      >
        <EmailIcon className="w-6 h-6" />
      </a>
    </div>
  );
};