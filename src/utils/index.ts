import {createClient, EntryCollection} from 'contentful';

import {CategoryModel, WithLinksCountCategory} from '@/api/contentful/models/blog';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
});

const withLinksCountToCategory = async (
  categories: EntryCollection<CategoryModel>
): Promise<Array<WithLinksCountCategory>> => {
  const LinksCount = await Promise.all(
    categories.items.map(async (category) => {
      const articles = await client.getEntries<any>({
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

export {withLinksCountToCategory};
