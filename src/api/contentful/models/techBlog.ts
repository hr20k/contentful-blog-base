import {Document} from '@contentful/rich-text-types';
import {Asset, EntryFields} from 'contentful';

interface TechBlogModel {
  slug: EntryFields.Text;
  title: EntryFields.Text;
  thumbnail: Asset | null;
  contents: Document | null;
}

export type {TechBlogModel};
