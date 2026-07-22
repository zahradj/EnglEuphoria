
export interface UrlValidationResult {
  isValid: boolean;
  isTrusted: boolean;
  processedUrl: string;
  warning?: string;
}

export function validateAndProcessUrl(url: string): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      isTrusted: false,
      processedUrl: '',
      warning: 'URL is required'
    };
  }

  try {
    // Clean up the URL
    let cleanUrl = url.trim();
    
    // Handle common URL formats
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const urlObj = new URL(cleanUrl);

    // Only allow HTTPS for security (except for localhost development)
    if (urlObj.protocol !== 'https:' && !urlObj.hostname.includes('localhost')) {
      return {
        isValid: false,
        isTrusted: false,
        processedUrl: '',
        warning: 'Only HTTPS URLs are allowed for security'
      };
    }

    // List of trusted educational domains
    const trustedDomains = [
      'scratch.mit.edu',
      'kahoot.it',
      'kahoot.com',
      'wordwall.net',
      'nearpod.com',
      'padlet.com',
      'jamboard.google.com',
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'education.com',
      'abcya.com',
      'coolmathgames.com',
      'funbrain.com',
      'pbs.org',
      'pbskids.org',
      'khanacademy.org',
      'code.org',
      'tinkercad.com',
      'flipgrid.com',
      'edpuzzle.com',
      'quizizz.com',
      'blooket.com',
      'gimkit.com',
      'classcraft.com',
      'seesaw.me',
      'flipboard.com',
      'prezi.com',
      'canva.com',
      'slides.com',
      'genially.com',
      'mentimeter.com',
      'polleverywhere.com',
      'gamestolearnenglish.com',
      'eslgamesplus.com',
      'eslkidslab.com',
      'learnenglishkids.britishcouncil.org',
      'cambridge.org',
      'oup.com',
      'macmillanenglish.com'
    ];

    const isTrusted = trustedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );

    // Process YouTube URLs to embed format
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = '';
      
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v') || '';
      }
      
      if (videoId) {
        cleanUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return {
      isValid: true,
      isTrusted,
      processedUrl: cleanUrl,
      warning: !isTrusted ? 'This domain is not on our trusted list. Content may be blocked by security policies.' : undefined
    };

  } catch (error) {
    return {
      isValid: false,
      isTrusted: false,
      processedUrl: '',
      warning: 'Invalid URL format'
    };
  }
}
