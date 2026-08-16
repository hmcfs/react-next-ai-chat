import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/home'],
      disallow: ['/api/', '/chat/', '/draft/', '/login', '/register'],
    },
    sitemap: 'https://clair-ai.com/sitemap.xml',
  };
}
