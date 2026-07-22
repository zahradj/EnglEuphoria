import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set security headers for the application
    const metaElements = [
      // Content Security Policy
      {
        httpEquiv: 'Content-Security-Policy',
        content: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://api.openai.com",
          "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
          "media-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'"
        ].join('; ')
      },
      // X-Content-Type-Options
      {
        httpEquiv: 'X-Content-Type-Options',
        content: 'nosniff'
      },
      // X-Frame-Options
      {
        httpEquiv: 'X-Frame-Options',
        content: 'DENY'
      },
      // X-XSS-Protection
      {
        httpEquiv: 'X-XSS-Protection',
        content: '1; mode=block'
      },
      // Referrer Policy
      {
        httpEquiv: 'Referrer-Policy',
        content: 'strict-origin-when-cross-origin'
      },
      // Permissions Policy
      {
        httpEquiv: 'Permissions-Policy',
        content: 'camera=(), microphone=(), geolocation=(), payment=()'
      }
    ];

    // Add or update meta tags
    metaElements.forEach(({ httpEquiv, content }) => {
      let metaTag = document.querySelector(`meta[http-equiv="${httpEquiv}"]`) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.httpEquiv = httpEquiv;
        document.head.appendChild(metaTag);
      }
      
      metaTag.content = content;
    });

    // Clean up function
    return () => {
      metaElements.forEach(({ httpEquiv }) => {
        const metaTag = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
        if (metaTag) {
          metaTag.remove();
        }
      });
    };
  }, []);
};