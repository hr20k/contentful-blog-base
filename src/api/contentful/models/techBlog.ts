import {Document} from '@contentful/rich-text-types';
import {Asset, Entry, EntryFields} from 'contentful';

interface TechBlogModel {
  slug: EntryFields.Text;
  title: EntryFields.Text;
  category: Entry<CategoryModel>;
  thumbnail: Asset | null;
  contents: Document | null;
}

interface CategoryModel {
  slug: EntryFields.Text;
  name: EntryFields.Text;
}

export type {TechBlogModel, CategoryModel};
