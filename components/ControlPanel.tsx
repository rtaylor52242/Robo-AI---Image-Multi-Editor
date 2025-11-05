import React, { useState, useCallback, ChangeEvent } from 'react';
import { BaseImage, AspectRatio } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ControlPanelProps {
  baseImage: BaseImage | null;
  setBaseImage: (image: BaseImage | null) => void;
  prompts: string[];
  setPrompts: (prompts: string[]) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
  useTexture: boolean;
  setUseTexture: (use: boolean) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  baseImage,
  setBaseImage,
  prompts,
  setPrompts,
  brandColor,
  setBrandColor,
  useTexture,
  setUseTexture,
  aspectRatio,
  setAspectRatio,
  onGenerate,
  isLoading,
}) => {
  const [newPrompt, setNewPrompt] = useState('');

  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const dataUrl = URL.createObjectURL(file);
      setBaseImage({ file, dataUrl });
    }
  }, [setBaseImage]);

  const addPrompt = () => {
    if (newPrompt.trim()) {
      setPrompts([...prompts, newPrompt.trim()]);
      setNewPrompt('');
    }
  };

  const removePrompt = (indexToRemove: number) => {
    setPrompts(prompts.filter((_, index) => index !== indexToRemove));
  };
  
  const isGenerateDisabled = !baseImage || prompts.length === 0 || isLoading;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-transparent p-6 rounded-2xl shadow-lg space-y-6 sticky top-8">
      {/* 1. Base Image */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Base Image</h2>
        {baseImage ? (
          <div className="relative group">
            <img src={baseImage.dataUrl} alt="Base preview" className="w-full rounded-lg" />
            <button
              onClick={() => setBaseImage(null)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-8 h-8 mb-3 text-gray-400 dark:text-gray-500" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, WEBP</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      {/* 2. Edit Prompts */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Edit Prompts</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPrompt()}
            placeholder="e.g., 'Add a coffee cup on the table'"
            className="flex-grow bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button onClick={addPrompt} className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-500 transition-colors flex-shrink-0">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {prompts.map((prompt, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
              <span className="text-sm text-gray-800 dark:text-gray-200">{prompt}</span>
              <button onClick={() => removePrompt(index)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                <TrashIcon className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Settings</h2>
        <div className="flex items-center justify-between">
          <label htmlFor="brand-color" className="text-gray-700 dark:text-gray-300">Brand Color</label>
          <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2">
            <input
              type="color"
              id="brand-color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-6 h-6 bg-transparent border-none cursor-pointer"
            />
             <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="bg-transparent w-20 text-gray-900 dark:text-white outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">Texture Overlay</label>
          <button
            onClick={() => setUseTexture(!useTexture)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useTexture ? 'bg-indigo-500' : 'bg-gray-400 dark:bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useTexture ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
       
      {/* 4. Export Options */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Export Options</h2>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setAspectRatio('original')} className={`py-2 text-sm rounded-md transition-colors ${aspectRatio === 'original' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Original</button>
            <button onClick={() => setAspectRatio('portrait')} className={`py-2 text-sm rounded-md transition-colors ${aspectRatio === 'portrait' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Post (1:1)</button>
            <button onClick={() => setAspectRatio('story')} className={`py-2 text-sm rounded-md transition-colors ${aspectRatio === 'story' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Story (9:16)</button>
            <button onClick={() => setAspectRatio('video')} className={`py-2 text-sm rounded-md transition-colors ${aspectRatio === 'video' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Video (16:9)</button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerateDisabled}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
        ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Generate {prompts.length > 0 ? prompts.length : ''} Variations</span>
            </>
        )}
      </button>
    </div>
  );
};