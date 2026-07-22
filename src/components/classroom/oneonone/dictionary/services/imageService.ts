
// Image service
export interface ImageResult {
  url: string;
  description: string;
}

export async function fetchImages(word: string, signal?: AbortSignal): Promise<ImageResult[]> {
  try {
    // Try with a demo API first, but expect it to fail
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=4&client_id=demo`,
      { signal }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((img: any) => ({
          url: img.urls.small,
          description: img.alt_description || word
        }));
      }
    }
    
    // Always fall back to generated images
    return generatePlaceholderImages(word);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    return generatePlaceholderImages(word);
  }
}

function generatePlaceholderImages(word: string): ImageResult[] {
  const colors = ['e3e3e3', 'f0f0f0', 'ddd', 'ccc'];
  const textColors = ['666666', '777777', '555555', '888888'];
  
  return colors.map((bgColor, index) => ({
    url: `https://via.placeholder.com/150x100/${bgColor}/${textColors[index]}?text=${encodeURIComponent(word)}`,
    description: `${word} illustration ${index + 1}`
  }));
}
