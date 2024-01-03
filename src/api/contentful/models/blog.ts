import {Entry, EntryFieldTypes} from 'contentful';

type ArticleEntrySkeleton = {
  contentTypeId: 'article';
  fields: {
    slug: EntryFieldTypes.Text;
    title: EntryFieldTypes.Text;
    category: EntryFieldTypes.EntryLink<CategoryEntrySkeleton>;
    thumbnail?: EntryFieldTypes.AssetLink;
    contents?: EntryFieldTypes.RichText;
  };
};

type CategoryEntrySkeleton = {
  contentTypeId: 'category';
  fields: {
    slug: EntryFieldTypes.Text;
    name: EntryFieldTypes.Text;
    order?: EntryFieldTypes.Number;
  };
};

type PrivacyPolicyEntrySkeleton = {
  contentTypeId: 'privacyPolicy';
  fields: {
    contents?: EntryFieldTypes.RichText;
  };
};

interface WithLinksCountCategory {
  category: Entry<CategoryEntrySkeleton, undefined, string>;
  count: number;
}

type SettingEntrySkeleton = {
  contentTypeId: 'setting';
  fields: {
    title: EntryFieldTypes.Text;
    description: EntryFieldTypes.Text;
    logo: EntryFieldTypes.AssetLink;
    defaultThumbnail: EntryFieldTypes.AssetLink;
    lineId?: EntryFieldTypes.Text;
  };
};

export type {
  ArticleEntrySkeleton,
  CategoryEntrySkeleton,
  PrivacyPolicyEntrySkeleton,
  WithLinksCountCategory,
  SettingEntrySkeleton,
};
