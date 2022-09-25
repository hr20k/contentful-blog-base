import {Box, Grid, useMediaQuery} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {format} from 'date-fns';
import {GetStaticProps} from 'next';
import * as React from 'react';

import {CategoryModel, ArticleModel, WithLinksCountCategory} from '@/api/contentful/models/blog';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {Adsense} from '@/components/molecules/Adsense';
import {CategoryCard} from '@/components/molecules/CategoryCard';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {ContentType} from '@/constants';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils';

interface HomeContainerProps {
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<ArticleModel>>;
}

interface HomeProps {
  categories: Array<CategoryLink>;
  links: Array<{
    category: CategoryLink;
    items: Array<{
      href: string;
      imageSrc?: string;
      title: string;
      date: string;
    }>;
  }>;
}

type ContainerProps = HomeContainerProps;

type Props = HomeProps;

const HomeContainer: React.FC<ContainerProps> = ({withLinksCountCategories, articles}) => {
  const categoryLinks = React.useMemo<Array<CategoryLink>>(
    () =>
      withLinksCountCategories.map(({category, count}) => ({
        title: category.fields.name,
        count,
        path: `/${category.fields.slug}`,
      })),
    [withLinksCountCategories]
  );

  const itemLinks = React.useMemo<
    Array<{
      category: CategoryLink;
      items: Array<{
        href: string;
        imageSrc?: string;
        title: string;
        date: string;
      }>;
    }>
  >(
    () => [
      {
        category: {
          count: 0,
          path: '/new',
          title: '新着記事',
        },
        items: articles.map(({fields: {title, slug, thumbnail, category}, sys: {createdAt}}) => {
          return {
            href: `/${category.fields.slug}/${slug}`,
            imageSrc: thumbnail?.fields.file.url,
            title,
            date: `${format(new Date(createdAt), 'yyyy年MM月dd日 HH:mm')}`,
          };
        }),
      },
      ...categoryLinks.map((link) => ({
        category: link,
        items: articles
          .filter(({fields: {category}}) => `/${category.fields.slug}` === link.path)
          .map(({fields: {title, slug, thumbnail, category}, sys: {createdAt}}) => {
            return {
              href: `/${category.fields.slug}/${slug}`,
              imageSrc: thumbnail?.fields.file.url,
              title,
              date: `${format(new Date(createdAt), 'yyyy年MM月dd日 HH:mm')}`,
            };
          }),
      })),
    ],
    [articles, categoryLinks]
  );

  return <Home links={itemLinks} categories={categoryLinks} />;
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
  });

  const entry = await client.getEntries<ArticleModel>({
    content_type: ContentType.Article,
  });
  const categoryEntries = await client.getEntries<CategoryModel>({
    content_type: ContentType.Category,
    order: 'fields.order',
  });
  const Linkscount = await withLinksCountToCategory(categoryEntries);

  return {
    props: {
      withLinksCountCategories: Linkscount,
      articles: entry.items,
    },
  };
};

const Home: React.FC<Props> = ({links, categories}) => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const msMatches = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Seo />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath="/"
        />
        <Box
          sx={{
            // width: matches ? '1200px' : 'auto',
            maxWidth: '1200px',
            margin: matches ? '48px auto' : '48px 16px',
          }}
        >
          <Grid container spacing={5}>
            <Grid item sm={12} md={8}>
              <Grid container>
                {links.map(({category, items}) => (
                  <Grid
                    key={category.path}
                    xs={12}
                    sm={6}
                    padding={msMatches ? '8px 8px 16px' : '8px 0 16px'}
                  >
                    <CategoryCard category={category} items={items} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Box
                sx={{
                  backgroundColor: '#094067',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <CategoryLinkList categories={categories} />
              </Box>
              <Box
                sx={{
                  marginTop: '16px',
                  fontSize: '0.875rem',
                }}
              >
                <PrivacyPolicyLink />
              </Box>
              <Adsense />
            </Grid>
          </Grid>
        </Box>
      </main>
    </>
  );
};

export type {HomeContainerProps, HomeProps};
export {getStaticProps};
export default HomeContainer;
