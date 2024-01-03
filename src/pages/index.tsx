import styled from '@emotion/styled';
import {Box, useMediaQuery} from '@mui/material';
import {Entry} from 'contentful';
import {GetStaticProps} from 'next';
import {useMemo} from 'react';

import {getAllArticles} from '@/api/contentful/models/article';
import {WithLinksCountCategory, ArticleEntrySkeleton} from '@/api/contentful/models/blog';
import {getCategories} from '@/api/contentful/models/category';
import {getSetting} from '@/api/contentful/models/setting';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {Adsense} from '@/components/molecules/Adsense';
import {CategoryCard} from '@/components/molecules/CategoryCard';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {formatJstDateString} from '@/utils';
import {withLinksCountToCategory} from '@/utils/server';

const Grid = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 270px',
  gridGap: '40px',
});

interface HomeContainerProps {
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<ArticleEntrySkeleton, 'WITHOUT_UNRESOLVABLE_LINKS', string>>;
  defaultThumbnailUrl: string;
  logoUrl: string;
}

interface HomeProps {
  categories: Array<CategoryLink>;
  links: Array<{
    category: CategoryLink;
    items: Array<{
      href: string;
      imageSrc: string;
      title: string;
      date: string;
    }>;
  }>;
  setting: {
    logoUrl: string;
  };
}

type ContainerProps = HomeContainerProps;

type Props = HomeProps;

const HomeContainer = ({
  withLinksCountCategories,
  articles,
  defaultThumbnailUrl,
  logoUrl,
}: ContainerProps): JSX.Element => {
  const categoryLinks = useMemo<Array<CategoryLink>>(
    () =>
      withLinksCountCategories.map(({category, count}) => ({
        title: category.fields.name,
        count,
        path: `/${category.fields.slug}`,
        id: category.sys.id,
      })),
    [withLinksCountCategories]
  );

  const itemLinks = useMemo<
    Array<{
      category: CategoryLink;
      items: Array<{
        href: string;
        imageSrc: string;
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
          id: '',
        },
        items: articles.flatMap(
          ({fields: {title, slug, thumbnail, category}, sys: {createdAt}}) => {
            if (category === undefined) {
              return [];
            }
            return [
              {
                href: `/${category.fields.slug}/${slug}`,
                imageSrc: thumbnail?.fields.file?.url ?? defaultThumbnailUrl,
                title,
                date: formatJstDateString(new Date(createdAt)),
              },
            ];
          }
        ),
      },
      ...categoryLinks.map((link) => ({
        category: link,
        items: articles
          .filter(
            ({fields: {category}}) =>
              category !== undefined && `/${category.fields.slug}` === link.path
          )
          .flatMap(({fields: {title, slug, thumbnail, category}, sys: {createdAt}}) => {
            if (category === undefined) {
              return [];
            }
            return [
              {
                href: `/${category.fields.slug}/${slug}`,
                imageSrc: thumbnail?.fields.file?.url ?? defaultThumbnailUrl,
                title,
                date: formatJstDateString(new Date(createdAt)),
              },
            ];
          }),
      })),
    ],
    [articles, categoryLinks, defaultThumbnailUrl]
  );

  return <Home links={itemLinks} categories={categoryLinks} setting={{logoUrl}} />;
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const {defaultThumbnailUrl, logoUrl} = await getSetting();
  const entry = await getAllArticles();
  const categoryEntries = await getCategories();
  const LinksCount = await withLinksCountToCategory(categoryEntries);

  if (defaultThumbnailUrl !== undefined && logoUrl !== undefined) {
    return {
      props: {
        withLinksCountCategories: LinksCount,
        articles: entry.items,
        defaultThumbnailUrl,
        logoUrl,
      },
    };
  }
  return {
    notFound: true,
  };
};

const Home = ({links, categories, setting}: Props): JSX.Element => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const msMatches = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Seo />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath="/"
          logoUrl={setting.logoUrl}
        />
        <div
          style={{
            maxWidth: matches ? '1200px' : undefined,
            padding: matches ? '48px 24px' : '48px 16px',
            margin: '0 auto',
            overflowX: 'hidden',
          }}
        >
          <Grid css={{gridTemplateColumns: matches ? undefined : '1fr'}}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: msMatches ? '1fr 1fr' : '1fr',
                gap: '16px',
              }}
            >
              {links.map(({category, items}) => (
                <Box
                  key={category.path}
                  sx={{
                    flex: 1,
                    minWidth: '150px',
                  }}
                >
                  <CategoryCard category={category} items={items} />
                </Box>
              ))}
            </Box>
            <div>
              <Box
                sx={{
                  backgroundColor: theme.palette.secondary.main,
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
            </div>
          </Grid>
        </div>
      </main>
    </>
  );
};

export type {HomeContainerProps, HomeProps};
export {getStaticProps};
export default HomeContainer;
