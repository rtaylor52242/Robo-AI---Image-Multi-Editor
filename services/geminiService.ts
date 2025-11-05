import { GoogleGenAI, Modality, Part } from "@google/genai";
import { AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

interface GenerateImageVariationParams {
  baseImagePart: Part;
  userPrompt: string;
  brandColor: string;
  useTexture: boolean;
  aspectRatio: AspectRatio;
}

const getAspectRatioPrompt = (aspectRatio: AspectRatio): string => {
    switch (aspectRatio) {
        case 'portrait':
            return 'The final image must have a 1:1 aspect ratio (e.g., 1080x1080 pixels), suitable for an Instagram post.';
        case 'story':
            return 'The final image must have a 9:16 aspect ratio (e.g., 1080x1920 pixels), suitable for an Instagram Story.';
        case 'video':
            return 'The final image must have a 16:9 aspect ratio (e.g., 1920x1080 pixels), suitable for a video thumbnail or YouTube.';
        case 'original':
        default:
            return 'The final image must have the same aspect ratio as the original image provided.';
    }
};

export const generateImageVariation = async ({
  baseImagePart,
  userPrompt,
  brandColor,
  useTexture,
  aspectRatio,
}: GenerateImageVariationParams): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const styleGuidelines: string[] = [];
  if (brandColor) {
      styleGuidelines.push(`- Subtly incorporate the brand color ${brandColor} into the theme where it makes sense (e.g., background, lighting), without overwriting important elements.`);
  }
  if (useTexture) {
      styleGuidelines.push('- Apply a subtle, professional texture overlay (like film grain or fine canvas) to the entire image for a premium feel.');
  }

  const fullPrompt = `
    You are an expert AI image editor for professional marketing and ad images.
    Your task is to apply a specific edit to a base image while strictly preserving key brand elements.

    **CRITICAL CONSTRAINTS**:
    1.  **Preserve Text and Logos**: Do NOT change, alter, remove, or add any text, logos, or coupon codes from the original image. They must remain perfectly intact.
    2.  **Maintain Layout**: The layout proportions and the relative positions of all elements (text, logos, main subjects) must be maintained.
    3.  **Adhere to Edit**: Apply ONLY the user-specified edit. Do not make any other creative changes.

    **User Edit Instruction**: "${userPrompt}"

    ${styleGuidelines.length > 0 ? `**Style Guidelines**:\n    ${styleGuidelines.join('\n    ')}` : ''}
    
    **Output Format**:
    - ${getAspectRatioPrompt(aspectRatio)}
  `;

  const contents = {
    parts: [
      baseImagePart,
      { text: fullPrompt },
    ],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in the API response.");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image variation.");
  }
};

export const removeImageBackground = async ({ baseImagePart }: { baseImagePart: Part }): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const fullPrompt = `
    You are an expert AI image editor.
    Your task is to perfectly remove the background from the provided image.
    
    **CRITICAL CONSTRAINTS**:
    1.  **Transparent Background**: The output image MUST have a transparent background.
    2.  **Preserve Subject**: The main subject of the image must be perfectly preserved with clean, crisp edges. Do not alter the subject in any way.
    3.  **Output Format**: The final output must be a PNG file with transparency.
  `;

  const contents = {
    parts: [
      baseImagePart,
      { text: fullPrompt },
    ],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in the API response.");
  } catch (error) {
    console.error("Error calling Gemini API for background removal:", error);
    throw new Error("Failed to remove image background.");
  }
};