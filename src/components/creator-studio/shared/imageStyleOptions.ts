/**
 * Hub-specific Image Style Matrix.
 * Drives the "Image Style" selector in the Generate Lesson Modal AND
 * is appended to every Imagen / Gemini-Image prompt downstream.
 */
import type { Hub } from './GenerateLessonModal';

export interface ImageStyleOption {
  /** Stable id sent to the backend. */
  id: string;
  /** Human label shown in the dropdown. */
  label: string;
  /** Strict suffix appended to the Google Imagen prompt to enforce the look. */
  promptSuffix: string;
}

export const IMAGE_STYLES_BY_HUB: Record<Hub, ImageStyleOption[]> = {
  playground: [
    {
      id: 'pip-fox',
      label: '🦊 Pip the Fox — Premium Glossy Chibi (House style)',
      promptSuffix:
        "rendered in the authentic, flawless 'Pip the Fox' Playground house style — premium glossy 3D-rendered chibi mascot illustration, soft rounded chibi proportions with oversized head, big sparkling reflective eyes with bright specular highlights, smooth toy-like glossy surfaces with soft rim lighting, subtle volumetric studio lighting, vibrant playful palette with warm orange/yellow brand accents, plush plasticine-like textures, joyful expressive pose, child-friendly ages 4-10, clean pure white background — exactly the look used in the Playground post-lesson summary card",
    },
    {
      id: 'kiwi',
      label: '🥝 Kiwi Storybook',
      promptSuffix:
        "rendered in an authentic, flawless 'Kiwi' children's book illustration style — soft rounded shapes, friendly cute mascot characters, gentle pastel and fresh fruity green-yellow palette, smooth thin outlines, warm storybook lighting, wholesome and joyful, age-appropriate for young children, pure flat white background",
    },
    {
      id: 'cheerful-cartoon',
      label: '🎨 Cheerful Cartoon',
      promptSuffix:
        'rendered in an authentic, flawless cheerful western cartoon style — bold black outlines, vibrant primary colours, simple shapes, friendly rounded characters, child-appropriate, no scary elements, pure white background',
    },
    {
      id: 'kawaii-chibi',
      label: '🌸 Kawaii Chibi',
      promptSuffix:
        'rendered in an authentic, flawless ultra-cute kawaii chibi cartoon mascot style — oversized sparkly anime eyes, soft pastel colours, blushed cheeks, smooth thin outlines, subtle cel shading, super-deformed proportions, sticker-like finish, child-friendly, pure flat white background',
    },
    {
      id: 'claymation',
      label: '🧱 Claymation',
      promptSuffix:
        'rendered in an authentic, flawless claymation style — soft plasticine textures, tactile fingerprint detail, gentle studio lighting, stop-motion charm, child-friendly, pure white background',
    },
    {
      id: 'cartoon-anime',
      label: '🌟 Cartoon Anime (Stories)',
      promptSuffix:
        'rendered as an authentic, flawless kid-friendly cartoon anime style — Studio Ghibli / Pokémon-inspired charm, clean confident ink outlines, expressive big sparkly anime eyes, soft cel-shaded colour fills, painterly storybook backgrounds with warm cinematic lighting, gentle wholesome mood perfect for narrative scenes, ages 4-9, no scary or mature elements',
    },
    {
      id: 'storybook-watercolor',
      label: '🎨 Storybook Watercolor',
      promptSuffix:
        'rendered as an authentic, flawless premium children\'s picture-book watercolor illustration — soft hand-painted watercolor washes, gentle paper texture, warm sunny palette, delicate ink line accents, cozy whimsical mood, magical storybook charm, ages 4-9, clean off-white background',
    },
    {
      id: 'pixar-3d',
      label: '🎬 Pixar-style 3D',
      promptSuffix:
        'rendered as an authentic, flawless premium animated 3D feature-film style — soft subsurface scattering, expressive Pixar/DreamWorks-quality character design, cinematic key lighting with warm rim light, polished smooth surfaces, vibrant playful palette, big friendly eyes, kid-safe, ages 4-9, clean white background',
    },
    {
      id: 'crayon-doodle',
      label: '✏️ Crayon Doodle',
      promptSuffix:
        'rendered as an authentic, flawless crayon and colored-pencil children\'s doodle style — textured waxy crayon strokes, hand-drawn wobbly outlines, bright primary scribble fills, paper grain, playful and naive, looks made by a happy child, ages 4-9, white paper background',
    },
    {
      id: 'paper-craft',
      label: '📄 Paper Craft Collage',
      promptSuffix:
        'rendered as an authentic, flawless layered paper-craft collage illustration — cut-paper shapes with visible torn edges, soft drop shadows between layers, bright construction-paper palette, tactile handmade feel, cheerful and tidy, ages 4-9, clean white background',
    },
    {
      id: 'felt-plush',
      label: '🧶 Felt & Plush',
      promptSuffix:
        'rendered as an authentic, flawless felt and plush-toy style — soft fuzzy fabric textures, visible stitch lines, button eyes, huggable rounded forms, warm cozy studio lighting, ultra cute toy-like characters, ages 4-9, clean white background',
    },
    {
      id: 'flashcard-flat',
      label: '🃏 Flashcard Flat',
      promptSuffix:
        'rendered as an authentic, flawless vocabulary-flashcard style — single centered subject, bold clean flat-vector shapes, thick friendly outlines, bright saturated kid-safe palette, no clutter, instantly readable, ages 4-9, pure flat white background',
    },
  ],
  academy: [
    {
      id: 'manga-comic',
      label: '🗡 Manga Comic (Default)',
      promptSuffix:
        'rendered in an authentic, flawless modern manga comic style — crisp black ink line art, dynamic panel composition, expressive teen character design, screentone and halftone shading, cel-shaded colour fills, contemporary shonen/shojo aesthetic, age-appropriate for teens',
    },
    {
      id: 'modern-vector',
      label: '🖥 Modern Vector Art',
      promptSuffix:
        'rendered in an authentic, flawless modern flat vector illustration style — clean geometric shapes, confident colour blocking, subtle gradients, sleek editorial composition, white background',
    },
    {
      id: 'cinematic-painting',
      label: '🎬 Cinematic Digital Painting',
      promptSuffix:
        'rendered in an authentic, flawless cinematic digital painting style — dramatic rim lighting, painterly brushwork, rich colour grading, concept-art quality, age-appropriate teen aesthetic',
    },
  ],
  success: [
    {
      id: 'realistic',
      label: '📷 Realistic (Default)',
      promptSuffix:
        'captured as authentic, flawless photo-realistic editorial photography — shot on a 35mm full-frame camera, true-to-life skin tones and materials, natural soft lighting, neutral corporate tones, shallow depth of field, premium business aesthetic, no illustration, no cartoon, no painting',
    },
    {
      id: 'realistic-3d',
      label: '🧊 Realistic 3D Render',
      promptSuffix:
        'rendered as an authentic, flawless realistic 3D render — physically-based materials, soft global illumination, subtle depth of field, premium product-visualisation quality',
    },
    {
      id: 'minimalist-stock',
      label: '🪄 Minimalist Stock Art',
      promptSuffix:
        'rendered as authentic, flawless minimalist stock illustration — restrained palette, generous whitespace, single focal subject, modern corporate aesthetic, clean and timeless',
    },
  ],
};

export const DEFAULT_IMAGE_STYLE_ID: Record<Hub, string> = {
  playground: 'pip-fox',
  academy: 'manga-comic',
  success: 'realistic',
};

export const getImageStyle = (hub: Hub, id?: string | null): ImageStyleOption => {
  const list = IMAGE_STYLES_BY_HUB[hub] || IMAGE_STYLES_BY_HUB.academy;
  return list.find((s) => s.id === id) ?? list.find((s) => s.id === DEFAULT_IMAGE_STYLE_ID[hub]) ?? list[0];
};
