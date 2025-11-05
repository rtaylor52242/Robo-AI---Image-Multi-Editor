export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  status: 'pending' | 'success' | 'error';
}

export type AspectRatio = 'original' | 'portrait' | 'story' | 'video';

export interface BaseImage {
  file: File;
  dataUrl: string;
}