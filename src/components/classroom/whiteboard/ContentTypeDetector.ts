export interface ContentTypeInfo {
  type: 'youtube' | 'vimeo' | 'webpage' | 'docs' | 'other';
  title: string;
  embedUrl?: string;
  thumbnail?: string;
}

export function detectContentType(url: string): ContentTypeInfo {
  const normalizedUrl = url.toLowerCase().trim();
  
  // YouTube detection
  if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
    return {
      type: 'youtube',
      title: 'YouTube Video',
      embedUrl: convertToYouTubeEmbed(url)
    };
  }
  
  // Vimeo detection
  if (normalizedUrl.includes('vimeo.com')) {
    return {
      type: 'vimeo',
      title: 'Vimeo Video',
      embedUrl: convertToVimeoEmbed(url)
    };
  }
  
  // Google Docs/Sheets/Slides detection
  if (normalizedUrl.includes('docs.google.com') || 
      normalizedUrl.includes('sheets.google.com') || 
      normalizedUrl.includes('slides.google.com')) {
    return {
      type: 'docs',
      title: 'Google Document',
      embedUrl: convertToGoogleDocsEmbed(url)
    };
  }
  
  // Educational sites that typically support embedding
  const educationalSites = [
    'khan-academy.org',
    'coursera.org',
    'edx.org',
    'udemy.com',
    'ted.com',
    'scratch.mit.edu',
    'code.org',
    'duolingo.com'
  ];
  
  if (educationalSites.some(site => normalizedUrl.includes(site))) {
    return {
      type: 'webpage',
      title: 'Educational Content',
      embedUrl: url
    };
  }
  
  // Default to webpage if HTTPS
  if (normalizedUrl.startsWith('https://')) {
    return {
      type: 'webpage',
      title: 'Web Content',
      embedUrl: url
    };
  }
  
  return {
    type: 'other',
    title: 'External Link'
  };
}

function convertToYouTubeEmbed(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?enablejsapi=1&origin=${window.location.origin}`;
  }
  
  return url;
}

function convertToVimeoEmbed(url: string): string {
  const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const match = url.match(regExp);
  
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  
  return url;
}

function convertToGoogleDocsEmbed(url: string): string {
  // Convert edit links to preview/embed links
  if (url.includes('/edit')) {
    return url.replace('/edit', '/preview');
  }
  
  return url;
}

export function isEmbeddable(url: string): boolean {
  const contentType = detectContentType(url);
  return contentType.type !== 'other' && contentType.embedUrl !== undefined;
}

export function getSafeEmbedUrl(url: string): string {
  const contentType = detectContentType(url);
  return contentType.embedUrl || url;
}