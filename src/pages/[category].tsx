import {ParsedUrlQuery} from 'querystring';

import {Block, Document, Inline} from '@contentful/rich-text-types';
import {Box, Grid, Typography, useMediaQuery} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {format} from 'date-fns';
import {GetStaticPaths, GetStaticProps} from 'next';
import Head from 'next/head';
import * as React from 'react';

import {
  CategoryModel,
  TechBlogModel,
  WithLinksCountCategory,
} from '@/api/contentful/models/techBlog';
import {ArticleCard} from '@/components/molecules/ArticleCard';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {Header} from '@/components/molecules/Header';
import {siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
});

interface Params extends ParsedUrlQuery {
  category: string;
}

interface CategoryContainerProps {
  category: Entry<CategoryModel>;
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<TechBlogModel>>;
}

interface CategoryProps {
  categoryTitle: string;
  breadCrumbs: Array<BreadCrumbsModel>;
    categories: Array<CategoryLink>;
  links: Array<{
    href: string;
    imageSrc?: string;
    title: string;
    date: string;
    contents: string;
  }>;
}

type ContainerProps = CategoryContainerProps;

type Props = CategoryProps;

const CategoryContainer: React.FC<ContainerProps> = ({
  category,
  withLinksCountCategories,
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
    sys: {createdAt},
  }) => {
    return {
      href: `/${category.fields.slug}/${slug}`,
      imageSrc: thumbnail?.fields.file.url,
      title,
      date: `${format(new Date(createdAt), 'yyyy年MM月dd日 HH:mm')}`,
      contents: createContentsStr(contents),
    };
  }), [articles]);

  const categoryLinks = React.useMemo(() =>
    withLinksCountCategories.map(({category, count}) => ({
      title: category.fields.name,
      count,
      path: `/${category.fields.slug}`,
    })), [withLinksCountCategories]);

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
      categories={categoryLinks}
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

  const categoryEntries = await client.getEntries<CategoryModel>({
    'content_type': 'category',
  });
  const Linkscount = await withLinksCountToCategory(categoryEntries);
  const currentCategory = categoryEntries.items.find(({fields}) =>
    fields.slug === params.category,
  );

  if (typeof currentCategory !== 'undefined') {
    const entry = await client.getEntries<TechBlogModel>({
      'content_type': 'techBlog',
      'fields.category.sys.contentType.sys.id': 'category',
      'fields.category.fields.slug': params.category,
    });

    return {
      props: {
        category: currentCategory,
        withLinksCountCategories: Linkscount,
        articles: entry.items,
      },
    };
  }

  return {
    notFound: true,
  };
};

const getStaticPaths: GetStaticPaths<Params> = async () => {
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

const Category: React.FC<Props> = ({
  categoryTitle,
  breadCrumbs,
  links,
  categories,
}) => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

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
            width: matches ? '900px' : 'auto',
            margin: matches ? '48px auto 48px' : '48px 16px',
          }}
        >
          <Grid
            container
            spacing={5}
          >
            <Grid item sm={12} md={8}>
              <Box>
                <BreadCrumbs breadCrumbs={breadCrumbs}/>
              </Box>
              <Typography
                variant='h1'
                sx={{
                  margin: '8px 0',
                }}
              >
                {categoryTitle}
              </Typography>
              {links.map(({href, title, date, imageSrc, contents}) => (
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
                    date={date}
                    imageSrc={imageSrc}
                    contents={contents}
                  />
                </Box>
              ))}
            </Grid>
            <Grid
              item
              sm={12}
              md={4}
            >
              <Box
                sx={{
                  backgroundColor: '#eaeaea',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <CategoryLinkList categories={categories}/>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </main>
    </div>
  );
};

export type {CategoryContainerProps, CategoryProps};
export {getStaticProps, getStaticPaths};
export default CategoryContainer;
