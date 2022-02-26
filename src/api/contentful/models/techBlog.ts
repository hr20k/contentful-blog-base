import {Document} from '@contentful/rich-text-types';
import {EntryFields} from 'contentful';

interface TechBlogModel {
  title: EntryFields.Text;
  slug: EntryFields.Text;
  contents: Document | null;
}

export type {TechBlogModel};
