import {ParsedUrlQuery} from 'querystring';

import {Block, Document, Inline} from '@contentful/rich-text-types';
import {Box, Grid, Typography, useMediaQuery} from '@mui/material';
import {Entry} from 'contentful';
import {GetStaticPaths, GetStaticProps} from 'next';
import {useMemo, VFC} from 'react';

import {
  CategoryModel,
  ArticleModel,
  WithLinksCountCategory,
  SettingModel,
} from '@/api/contentful/models/blog';
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

interface Params extends ParsedUrlQuery {
  category: string;
}

interface CategoryContainerProps {
  category: Entry<CategoryModel>;
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<ArticleModel>>;
  blogSetting: Entry<SettingModel>;
}

interface CategoryProps {
  path: string;
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
  setting: {
    logoUrl: string;
  };
}

type ContainerProps = CategoryContainerProps;

type Props = CategoryProps;

const CategoryContainer: VFC<ContainerProps> = ({
  category,
  withLinksCountCategories,
  articles,
  blogSetting,
}) => {
  const getValue = (content: Block | Inline): string => {
    return content.content
      .map((c) => {
        if (c.nodeType === 'text') {
          return c.value;
        }
        return getValue(c);
      })
      .join('');
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

  const defaultThumbnailUrl = useMemo<string | undefined>(
    () =>
      typeof blogSetting !== 'undefined'
        ? `https:${blogSetting.fields.defaultThumbnail.fields.file.url}`
        : undefined,
    [blogSetting]
  );

  const links = useMemo(
    () =>
      articles.map(({fields: {title, slug, thumbnail, contents}, sys: {createdAt}}) => {
        return {
          href: `/${category.fields.slug}/${slug}`,
          imageSrc: thumbnail?.fields.file.url ?? defaultThumbnailUrl,
          title,
          date: formatJstDateString(new Date(createdAt)),
          contents: createContentsStr(contents),
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
      setting={{
        logoUrl: `https:${blogSetting.fields.logo.fields.file.url}`,
      }}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps, Params> = async ({params}) => {
  if (typeof params === 'undefined') {
    return {
      notFound: true,
    };
  }

  const settings = await client.getEntries<SettingModel>({
    content_type: ContentType.Setting,
  });
  const blogSetting = settings.items.pop();

  const categoryEntries = await client.getEntries<CategoryModel>({
    content_type: ContentType.Category,
    order: 'fields.order',
  });
  const LinksCount = await withLinksCountToCategory(categoryEntries);
  const currentCategory = categoryEntries.items.find(({fields}) => fields.slug === params.category);

  if (typeof currentCategory !== 'undefined' && typeof blogSetting !== 'undefined') {
    const entry = await client.getEntries<ArticleModel>({
      content_type: ContentType.Article,
      'fields.category.sys.contentType.sys.id': ContentType.Category,
      'fields.category.fields.slug': params.category,
    });

    return {
      props: {
        category: currentCategory,
        withLinksCountCategories: LinksCount,
        articles: entry.items,
        blogSetting,
      },
    };
  }

  return {
    notFound: true,
  };
};

const getStaticPaths: GetStaticPaths<Params> = async () => {
  const entries = await client.getEntries<CategoryModel>({
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

const Category: React.FC<Props> = ({
  path,
  categoryTitle,
  breadCrumbs,
  links,
  categories,
  setting,
}) => {
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
            width: matches ? '900px' : 'auto',
            margin: matches ? '48px auto 48px' : '48px 16px',
          }}
        >
          <Grid container spacing={5}>
            <Grid item sm={12} md={8}>
              <Box>
                <BreadCrumbs breadCrumbs={breadCrumbs} />
              </Box>
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
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
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
            </Grid>
          </Grid>
        </Box>
      </main>
    </>
  );
};

export type {CategoryContainerProps, CategoryProps};
export {getStaticProps, getStaticPaths};
export default CategoryContainer;
