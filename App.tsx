import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Part } from "@google/genai";
import { GeneratedImage, AspectRatio, BaseImage } from './types';
import { generateImageVariation, removeImageBackground } from './services/geminiService';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ShareButtons } from './components/ShareButtons';
import { ImageModal } from './components/ImageModal';
import { ThemeToggle } from './components/ThemeToggle';
import { HelpModal } from './components/HelpModal';
import { QuestionMarkIcon } from './components/icons/QuestionMarkIcon';

declare global {
  interface Window {
    JSZip: any;
    saveAs: any;
  }
}

// Helper to convert File to a Gemini Part object
const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
}


const App: React.FC = () => {
  const [baseImage, setBaseImage] = useState<BaseImage | null>(null);
  const [prompts, setPrompts] = useState<string[]>(['swap burger with sushi', 'change background to a red gradient']);
  const [brandColor, setBrandColor] = useState<string>('#6366F1');
  const [useTexture, setUseTexture] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleGenerate = useCallback(async () => {
    if (!baseImage || prompts.length === 0) {
      setError('Please upload a base image and add at least one prompt.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const placeholderImages: GeneratedImage[] = prompts.map((p, i) => ({
      id: `${Date.now()}-${i}`,
      prompt: p,
      imageUrl: '',
      status: 'pending',
    }));
    setGeneratedImages(placeholderImages);

    try {
        const imagePart = await fileToGenerativePart(baseImage.file);

        const generationPromises = prompts.map((prompt, index) =>
            generateImageVariation({
                baseImagePart: imagePart,
                userPrompt: prompt,
                brandColor,
                useTexture,
                aspectRatio,
            }).then(resultUrl => ({ index, resultUrl, status: 'success' as const }))
            .catch(err => {
                console.error(`Error for prompt "${prompt}":`, err);
                return { index, resultUrl: '', status: 'error' as const };
            })
        );
        
        const results = await Promise.all(generationPromises);

        setGeneratedImages(prevImages => {
            const newImages = [...prevImages];
            results.forEach(res => {
                if (newImages[res.index]) {
                    newImages[res.index].imageUrl = res.resultUrl;
                    newImages[res.index].status = res.status;
                }
            });
            return newImages;
        });

    } catch (e) {
        console.error("Failed to prepare image for generation:", e);
        setError("Failed to process the uploaded image. Please try another one.");
        setGeneratedImages([]);
    } finally {
        setIsLoading(false);
    }
  }, [baseImage, prompts, brandColor, useTexture, aspectRatio]);
  
  const handleRemoveBackground = useCallback(async (imageToEdit: GeneratedImage) => {
    const originalImageIndex = generatedImages.findIndex(img => img.id === imageToEdit.id);
    if (originalImageIndex === -1) return;

    const placeholder: GeneratedImage = {
        id: `${Date.now()}-bg-removed`,
        prompt: `Background removed for: "${imageToEdit.prompt}"`,
        imageUrl: '',
        status: 'pending',
    };

    const newImages = [...generatedImages];
    newImages.splice(originalImageIndex + 1, 0, placeholder);
    setGeneratedImages(newImages);

    try {
        const imageFile = await dataUrlToFile(imageToEdit.imageUrl, 'image-to-edit.png');
        const imagePart = await fileToGenerativePart(imageFile);
        
        const resultUrl = await removeImageBackground({ baseImagePart: imagePart });
        
        setGeneratedImages(currentImages => currentImages.map(img => 
            img.id === placeholder.id 
            ? { ...img, status: 'success', imageUrl: resultUrl } 
            : img
        ));
    } catch (e) {
        console.error("Failed to remove background:", e);
        setError("Failed to remove background from the image.");
        setGeneratedImages(currentImages => currentImages.map(img => 
            img.id === placeholder.id 
            ? { ...img, status: 'error' } 
            : img
        ));
    }
  }, [generatedImages]);

  const openImageModal = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <div className="absolute top-0 right-0 flex items-center gap-1">
             <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Open help guide"
            >
              <QuestionMarkIcon className="w-6 h-6" />
            </button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
          <div className="flex items-center justify-center gap-3">
             <SparklesIcon className="w-8 h-8 text-indigo-400" />
             <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Robo AI - Image Multi-Editor
             </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Generate multiple ad variations in seconds</p>
          <div className="mt-4 flex justify-center">
            <ShareButtons />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ControlPanel
              baseImage={baseImage}
              setBaseImage={setBaseImage}
              prompts={prompts}
              setPrompts={setPrompts}
              brandColor={brandColor}
              setBrandColor={setBrandColor}
              useTexture={useTexture}
              setUseTexture={setUseTexture}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsDisplay
              images={generatedImages}
              isLoading={isLoading}
              onImageClick={openImageModal}
              onRemoveBackground={handleRemoveBackground}
            />
          </div>
        </main>
        {error && (
            <div className="fixed bottom-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg z-20">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="absolute top-1 right-2 text-lg">&times;</button>
            </div>
        )}
      </div>
      <ImageModal image={selectedImage} onClose={closeImageModal} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
};

export default App;
