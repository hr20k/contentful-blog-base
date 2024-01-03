import {ArticleEntrySkeleton} from '@/api/contentful/models/blog';
import {ContentType} from '@/constants';
import {client} from '@/utils/contentful';

export const getAllArticles = async () => {
  return await client.withoutUnresolvableLinks.getEntries<ArticleEntrySkeleton>({
    content_type: ContentType.Article,
  });
};

export const getNewArticles = async ({limit}: {limit: number}) => {
  return await client.withoutUnresolvableLinks.getEntries<ArticleEntrySkeleton>({
    content_type: ContentType.Article,
    limit,
  });
};

export const getArticlesByCategory = async ({categorySlug}: {categorySlug: string}) => {
  return await client.withoutUnresolvableLinks.getEntries<ArticleEntrySkeleton>({
    content_type: ContentType.Article,
    'fields.category.sys.contentType.sys.id': ContentType.Category,
    'fields.category.fields.slug': categorySlug,
  });
};

export const getArticleBySlug = async ({
  slug,
  categorySlug,
}: {
  slug: string;
  categorySlug: string;
}) => {
  const articles = await client.withoutUnresolvableLinks.getEntries<ArticleEntrySkeleton>({
    content_type: ContentType.Article,
    'fields.slug': slug,
    'fields.category.sys.contentType.sys.id': ContentType.Category,
    'fields.category.fields.slug': categorySlug,
    limit: 1,
  });
  return articles.items.at(0);
};
