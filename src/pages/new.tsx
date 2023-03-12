import {Block, Document, Inline} from '@contentful/rich-text-types';
import {Box, Grid, useMediaQuery} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {format} from 'date-fns';
import {GetStaticProps} from 'next';
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
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {ContentType} from '@/constants';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils';

interface HomeContainerProps {
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<ArticleModel>>;
  blogSetting: Entry<SettingModel> | undefined;
}

interface HomeProps {
  categories: Array<CategoryLink>;
  links: Array<{
    href: string;
    imageSrc?: string;
    title: string;
    date: string;
    contents: string;
  }>;
  setting: {
    logoUrl?: string;
  };
}

type ContainerProps = HomeContainerProps;

type Props = HomeProps;

const HomeContainer: VFC<ContainerProps> = ({withLinksCountCategories, articles, blogSetting}) => {
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
      articles.map(({fields: {title, slug, thumbnail, category, contents}, sys: {createdAt}}) => {
        return {
          href: `/${category.fields.slug}/${slug}`,
          imageSrc: thumbnail?.fields.file.url ?? defaultThumbnailUrl,
          title,
          date: `${format(new Date(createdAt), 'yyyy年MM月dd日 HH:mm')}`,
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

  return (
    <Home
      links={links}
      categories={categoryLinks}
      setting={{
        logoUrl:
          typeof blogSetting !== 'undefined'
            ? `https:${blogSetting.fields.logo.fields.file.url}`
            : undefined,
      }}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
  });

  const settings = await client.getEntries<SettingModel>({
    content_type: ContentType.Setting,
  });
  const blogSetting = settings.items.pop();

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
      blogSetting,
    },
  };
};

const Home: React.FC<Props> = ({links, categories, setting}) => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <Seo />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath="/"
          logoUrl={setting.logoUrl}
        />
        <Box
          sx={{
            width: matches ? '900px' : 'auto',
            margin: matches ? '48px auto' : '48px 16px',
          }}
        >
          <Grid container spacing={5}>
            <Grid item sm={12} md={8}>
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

export type {HomeContainerProps, HomeProps};
export {getStaticProps};
export default HomeContainer;
