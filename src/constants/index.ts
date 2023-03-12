const siteUrl = process.env.NEXT_PUBLIC_BLOG_URL ?? '';

const siteTitle = process.env.NEXT_PUBLIC_BLOG_TITLE ?? 'My Blog';

const siteDescription = process.env.NEXT_PUBLIC_BLOG_DESCRIPTION ?? '';

const ContentType = {
  Article: 'article',
  Category: 'category',
  PrivacyPolicy: 'privacyPolicy',
  Setting: 'setting',
} as const;

type ContentType = typeof ContentType[keyof typeof ContentType];

export {siteUrl, siteTitle, siteDescription, ContentType};
