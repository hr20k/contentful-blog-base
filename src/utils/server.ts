import {EntryCollection} from 'contentful';

import {
  ArticleEntrySkeleton,
  CategoryEntrySkeleton,
  WithLinksCountCategory,
} from '@/api/contentful/models/blog';
import {client} from '@/utils/contentful';

export const withLinksCountToCategory = async (
  categories: EntryCollection<CategoryEntrySkeleton, undefined, string>
): Promise<Array<WithLinksCountCategory>> => {
  if (typeof window !== 'undefined') {
    throw new Error('You cannot call this method for client.');
  }
  const LinksCount = await Promise.all(
    categories.items.map(async (category) => {
      const articles = await client.getEntries<ArticleEntrySkeleton>({
        links_to_entry: category.sys.id,
      });
      return {
        category,
        count: articles.total,
      };
    })
  );
  return LinksCount;
};
