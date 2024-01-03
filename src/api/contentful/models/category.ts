import {CategoryEntrySkeleton} from '@/api/contentful/models/blog';
import {ContentType} from '@/constants';
import {client} from '@/utils/contentful';

export const getCategories = async () => {
  return await client.getEntries<CategoryEntrySkeleton>({
    content_type: ContentType.Category,
    order: ['fields.order'],
  });
};
