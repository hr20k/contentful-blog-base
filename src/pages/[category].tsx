import {ParsedUrlQuery} from 'querystring';

import {Block, Document, Inline} from '@contentful/rich-text-types';
import {Box, Typography, useMediaQuery} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {GetStaticPaths, GetStaticProps} from 'next';
import Head from 'next/head';
import * as React from 'react';

import {CategoryModel, TechBlogModel} from '@/api/contentful/models/techBlog';
import {ArticleCard} from '@/components/molecules/ArticleCard';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {Header} from '@/components/molecules/Header';
import {siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {theme} from '@/styles/theme/theme';

interface Params extends ParsedUrlQuery {
  category: string;
}

interface CategoryContainerProps {
  category: Entry<CategoryModel>
  articles: Array<Entry<TechBlogModel>>;
}

interface CategoryProps {
  categoryTitle: string;
  breadCrumbs: Array<BreadCrumbsModel>;
  links: Array<{
    href: string;
    imageSrc?: string;
    title: string;
    contents: string;
  }>;
}

type ContainerProps = CategoryContainerProps;

type Props = CategoryProps;

const CategoryContainer: React.FC<ContainerProps> = ({
  category,
  articles,
}) => {
  const getValue = (content: Block | Inline): string => {
    return content.content.map((c) => {
      if (c.nodeType === 'text') {
        return c.value;
      }
      return getValue(c);
    }).join('');
  };

  const createContentsStr = (contents: Document | null): string => {
    let contentsStr = '';
    contents?.content.forEach((c) => {
      c.content.forEach((cc) => {
        if (cc.nodeType === 'text') {
          contentsStr += cc.value;
        } else {
          contentsStr += getValue(cc);
        }
      });
    });
    return contentsStr;
  };

  const links = React.useMemo(() => articles.map(({
    fields: {title, slug, thumbnail, contents},
  }) => {
    return {
      href: `/${category.fields.slug}/${slug}`,
      imageSrc: thumbnail?.fields.file.url,
      title,
      contents: createContentsStr(contents),
    };
  }), [articles]);

  const categoryTitle = React.useMemo(() => category.fields.name, []);

  const breadCrumbs: Array<BreadCrumbsModel> = React.useMemo(() => {
    return [
      {
        href: '/',
        displayName: siteTitle,
      },
      {
        href: `/${category.fields.slug}`,
        displayName: categoryTitle,
      },
    ];
  }, []);


  return (
    <Category
      categoryTitle={categoryTitle}
      breadCrumbs={breadCrumbs}
      links={links}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps, Params> = async ({
  params,
}) => {
  if (typeof params === 'undefined') {
    return {
      notFound: true,
    };
  }

  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
  });

  const categoryEntry = await client.getEntries<CategoryModel>({
    'content_type': 'category',
    'fields.slug': params.category,
    'limit': 1,
  });
  const category = categoryEntry.items.shift();

  if (typeof category !== 'undefined') {
    const entry = await client.getEntries<TechBlogModel>({
      'content_type': 'techBlog',
      'fields.category.sys.contentType.sys.id': 'category',
      'fields.category.fields.slug': params.category,
    });

    return {
      props: {
        category: category,
        articles: entry.items,
      },
    };
  }

  return {
    notFound: true,
  };
};

const getStaticPaths: GetStaticPaths<Params> = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
  });
  const entries = await client.getEntries<CategoryModel>({
    'content_type': 'category',
  });
  const paths = entries.items.map((item) => ({
    params: {
      category: item.fields.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

const Category: React.FC<Props> = ({categoryTitle, breadCrumbs, links}) => {
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div>
      <Head>
        <title>{`${categoryTitle} | Tech Blog`}</title>
        <meta name="description" content="フロントエンドの技術的なことを書くブログです" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <Box
          sx={{
            width: matches ? '640px' : 'auto',
            margin: matches ? '48px auto' : '48px 16px',
          }}
        >
          <BreadCrumbs breadCrumbs={breadCrumbs}/>
          <Typography
            variant='h1'
          >
            {categoryTitle}
          </Typography>
          {links.map(({href, title, imageSrc, contents}) => (
            <Box
              key={href}
              sx={{
                marginTop: '16px',
                ['&:first-of-type']: {
                  marginTop: '0',
                },
              }}
            >
              <ArticleCard
                key={href}
                href={href}
                title={title}
                imageSrc={imageSrc}
                contents={contents}
              />
            </Box>
          ))}
        </Box>
      </main>
    </div>
  );
};

export type {CategoryContainerProps, CategoryProps};
export {getStaticProps, getStaticPaths};
export default CategoryContainer;
