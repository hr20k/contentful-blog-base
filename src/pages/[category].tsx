import {ParsedUrlQuery} from 'querystring';

import {Block, Document, Inline} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Typography, useMediaQuery} from '@mui/material';
import {Entry} from 'contentful';
import {GetStaticPaths, GetStaticProps} from 'next';
import {useMemo} from 'react';

import {getArticlesByCategory} from '@/api/contentful/models/article';
import {
  WithLinksCountCategory,
  CategoryEntrySkeleton,
  ArticleEntrySkeleton,
} from '@/api/contentful/models/blog';
import {getCategories} from '@/api/contentful/models/category';
import {getSetting} from '@/api/contentful/models/setting';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {ArticleCard} from '@/components/molecules/ArticleCard';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {ContentType, siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {formatJstDateString} from '@/utils';
import {client} from '@/utils/contentful';
import {withLinksCountToCategory} from '@/utils/server';

const URL_REGEX = /https?:\/\/[^\s]+/g;

const Grid = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 270px',
  gridGap: '40px',
});

interface Params extends ParsedUrlQuery {
  category: string;
}

interface CategoryContainerProps {
  category: Entry<CategoryEntrySkeleton, undefined, string>;
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<ArticleEntrySkeleton, 'WITHOUT_UNRESOLVABLE_LINKS', string>>;
  defaultThumbnailUrl: string;
  logoUrl: string;
}

interface CategoryProps {
  path: string;
  categoryTitle: string;
  breadCrumbs: Array<BreadCrumbsModel>;
  categories: Array<CategoryLink>;
  links: Array<{
    href: string;
    imageSrc: string;
    title: string;
    date: string;
    contents: string;
  }>;
  setting: {
    logoUrl: string;
  };
}

type ContainerProps = CategoryContainerProps;

type Props = CategoryProps;

const CategoryContainer = ({
  category,
  withLinksCountCategories,
  articles,
  defaultThumbnailUrl,
  logoUrl,
}: ContainerProps): JSX.Element => {
  const getValue = (content: Block | Inline): string => {
    return content.content
      .map((c) => {
        if (c.nodeType === 'text') {
          return typeof c.value === 'string' ? c.value.replaceAll(URL_REGEX, '') : '';
        }
        return getValue(c);
      })
      .join('');
  };

  const createContentsStr = (contents: Document): string => {
    let contentsStr = '';
    contents?.content.forEach((c) => {
      c.content.forEach((cc) => {
        if (cc.nodeType === 'text') {
          contentsStr += typeof cc.value === 'string' ? cc.value.replaceAll(URL_REGEX, '') : '';
        } else {
          contentsStr += getValue(cc);
        }
      });
    });
    return contentsStr;
  };

  const links = useMemo(
    () =>
      articles.map(({fields: {title, slug, thumbnail, contents}, sys: {createdAt}}) => {
        return {
          href: `/${category.fields.slug}/${slug}`,
          imageSrc: thumbnail?.fields.file?.url ?? defaultThumbnailUrl,
          title,
          date: formatJstDateString(new Date(createdAt)),
          contents: contents ? createContentsStr(contents) : '',
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [articles]
  );

  const categoryLinks = useMemo(
    () =>
      withLinksCountCategories.map(({category, count}) => ({
        title: category.fields.name,
        count,
        path: `/${category.fields.slug}`,
        id: category.sys.id,
      })),
    [withLinksCountCategories]
  );

  const categoryTitle = useMemo(() => category.fields.name, [category.fields.name]);

  const breadCrumbs: Array<BreadCrumbsModel> = useMemo(() => {
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
  }, [category.fields.slug, categoryTitle]);

  return (
    <Category
      path={`/${category.fields.slug}`}
      categoryTitle={categoryTitle}
      breadCrumbs={breadCrumbs}
      categories={categoryLinks}
      links={links}
      setting={{logoUrl}}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps, Params> = async ({params}) => {
  if (params === undefined) {
    return {
      notFound: true,
    };
  }

  const {defaultThumbnailUrl, logoUrl} = await getSetting();

  const categoryEntries = await getCategories();
  const LinksCount = await withLinksCountToCategory(categoryEntries);
  const currentCategory = categoryEntries.items.find(({fields}) => fields.slug === params.category);

  if (currentCategory !== undefined && defaultThumbnailUrl !== undefined && logoUrl !== undefined) {
    const entry = await getArticlesByCategory({categorySlug: currentCategory.fields.slug});
    return {
      props: {
        category: currentCategory,
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

const getStaticPaths: GetStaticPaths<Params> = async () => {
  const entries = await client.getEntries<CategoryEntrySkeleton>({
    content_type: ContentType.Category,
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

const Category = ({
  path,
  categoryTitle,
  breadCrumbs,
  links,
  categories,
  setting,
}: Props): JSX.Element => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <Seo title={categoryTitle} />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath={path}
          logoUrl={setting.logoUrl}
        />
        <Box
          sx={{
            width: matches ? '900px' : undefined,
            padding: matches ? '48px 24px' : '48px 16px',
            margin: '0 auto',
          }}
        >
          <Grid css={{gridTemplateColumns: matches ? undefined : '1fr'}}>
            <div>
              <div>
                <BreadCrumbs breadCrumbs={breadCrumbs} />
              </div>
              <Typography
                variant="h1"
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
            </div>
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
            </div>
          </Grid>
        </Box>
      </main>
    </>
  );
};

export type {CategoryContainerProps, CategoryProps};
export {getStaticProps, getStaticPaths};
export default CategoryContainer;
