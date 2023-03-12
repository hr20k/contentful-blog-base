import {Document} from '@contentful/rich-text-types';
import {Asset, Entry, EntryFields} from 'contentful';

interface ArticleModel {
  slug: EntryFields.Text;
  title: EntryFields.Text;
  category: Entry<CategoryModel>;
  thumbnail: Asset | null;
  contents: Document | null;
}

interface CategoryModel {
  slug: EntryFields.Text;
  name: EntryFields.Text;
  order?: number;
  id: string;
}

interface PrivacyPolicyModel {
  contents: Document | null;
}

interface WithLinksCountCategory {
  category: Entry<CategoryModel>;
  count: number;
}

interface SettingModel {
  title: string;
  description: string;
  logo: Asset;
  defaultThumbnail: Asset;
}

export type {ArticleModel, CategoryModel, PrivacyPolicyModel, WithLinksCountCategory, SettingModel};
