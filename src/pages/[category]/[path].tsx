import {ParsedUrlQuery} from 'querystring';

import {Document} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Typography, useMediaQuery} from '@mui/material';
import {Entry} from 'contentful';
import {JSDOM} from 'jsdom';
import {GetStaticPaths, GetStaticProps} from 'next';
import Image from 'next/image';
import {useMemo} from 'react';

import {getArticleBySlug} from '@/api/contentful/models/article';
import {
  WithLinksCountCategory,
  CategoryEntrySkeleton,
  ArticleEntrySkeleton,
} from '@/api/contentful/models/blog';
import {getCategories} from '@/api/contentful/models/category';
import {getSetting} from '@/api/contentful/models/setting';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {BlogContent} from '@/components/molecules/BlogContent';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {Share} from '@/components/molecules/Share';
import {TableOfContents} from '@/components/molecules/TableOfContents';
import {ContentType, siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {formatJstDateString, nonNullable} from '@/utils';
import {client} from '@/utils/contentful';
import {withLinksCountToCategory} from '@/utils/server';

const Toc = styled.div({
  margin: '48px 0',
});

const Grid = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 270px',
  gridGap: '40px',
});

interface LinkData {
  url: string;
  title: string;
  description: string;
  image: string;
}

interface Params extends ParsedUrlQuery {
  category: string;
  path: string;
}

interface ArticleContainerProps {
  path: string;
  category: Entry<CategoryEntrySkeleton, undefined, string>;
  article: Entry<ArticleEntrySkeleton, 'WITHOUT_UNRESOLVABLE_LINKS', string>;
  withLinksCountCategories: Array<WithLinksCountCategory>;
  lineId: string;
  defaultThumbnailUrl: string;
  logoUrl: string;
  linksByUrl: Record<string, LinkData>;
}

interface ArticleProps {
  path: string;
  title: string;
  date: string;
  breadCrumbs: Array<BreadCrumbsModel>;
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  contents?: Document;
  categories: Array<CategoryLink>;
  linksByUrl: Record<string, LinkData>;
  setting: {
    logoUrl: string;
    defaultThumbnailUrl: string;
    lineId?: string;
  };
}

type ContainerProps = ArticleContainerProps;

type Props = ArticleProps;

const ArticleContainer = ({
  path,
  category,
  article,
  withLinksCountCategories,
  lineId,
  defaultThumbnailUrl,
  logoUrl,
  linksByUrl,
}: ContainerProps): JSX.Element => {
  const breadCrumbs: Array<BreadCrumbsModel> = useMemo(() => {
    return [
      {
        href: '/',
        displayName: siteTitle,
      },
      {
        href: `/${category.fields.slug}`,
        displayName: category.fields.name,
      },
      {
        href: `/${category.fields.slug}/${path}`,
        displayName: article.fields.title,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <Article
      path={path}
      title={article.fields.title}
      date={formatJstDateString(new Date(article.sys.createdAt))}
      breadCrumbs={breadCrumbs}
      imageSrc={article.fields.thumbnail?.fields.file?.url}
      imageWidth={article.fields.thumbnail?.fields.file?.details.image?.width}
      imageHeight={article.fields.thumbnail?.fields.file?.details.image?.height}
      contents={article.fields.contents}
      categories={categoryLinks}
      linksByUrl={linksByUrl}
      setting={{
        logoUrl,
        defaultThumbnailUrl,
        lineId,
      }}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps, Params> = async ({params}) => {
  if (params?.path === undefined) {
    return {notFound: true};
  }

  const {defaultThumbnailUrl, logoUrl, lineId} = await getSetting();
  const item = await getArticleBySlug({
    slug: params.path,
    categorySlug: params.category,
  });
  const categoryEntries = await getCategories();
  const LinksCount = await withLinksCountToCategory(categoryEntries);
  const currentCategory = categoryEntries.items.find(({fields}) => fields.slug === params.category);

  if (
    currentCategory === undefined ||
    item === undefined ||
    lineId === undefined ||
    defaultThumbnailUrl === undefined ||
    logoUrl === undefined
  ) {
    return {notFound: true};
  }

  const contentsStr = JSON.stringify(item.fields.contents?.content ?? {});
  const matches = contentsStr.matchAll(
    /("nodeType":\s?"text",\s?"value":\s?|"uri":\s?)"(https:\/\/[^"]+)"/g
  );
  const urls: Array<string> = [];
  for (const match of matches) {
    if (match.length === 3) {
      urls.push(match[2]);
    }
  }

  const linkDataList = await Promise.all(
    Array.from(new Set(urls)).map(async (link) => {
      const metas = await fetch(link)
        // 3. URLからtext/htmlデータを取得 ====================================
        .then((res) => res.text())
        .then((text) => {
          const metaData: LinkData = {
            url: link,
            title: '',
            description: '',
            image: '',
          };
          // 4. 取得したtext/htmlデータから該当するmetaタグを取得 ==============
          const doms = new JSDOM(text);
          const metas = doms.window.document.getElementsByTagName('meta');

          // 5. title, description, imageにあたる情報を取り出し配列として格納 ==
          for (let i = 0; i < metas.length; i++) {
            const property = metas[i].getAttribute('property');
            const name = metas[i].getAttribute('name');
            const content = metas[i].getAttribute('content');

            metaData.title =
              (property?.match('title') || name?.match('title')) &&
              typeof content === 'string' &&
              metaData.title === ''
                ? content
                : metaData.title;
            metaData.description =
              (property?.match('description') || name?.match('description')) &&
              typeof content === 'string' &&
              metaData.description === ''
                ? content
                : metaData.description;
            metaData.image =
              (property?.match('image') || name?.match('image')) &&
              typeof content === 'string' &&
              metaData.image === ''
                ? content
                : metaData.image;
          }

          // amazon は画像がメタタグから取得できないのでASINコードコードから取得する
          if (metaData.image === '' && metaData.url.match(/amazon/)) {
            const asin = link.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
            if (Array.isArray(asin) && asin.length >= 2) {
              metaData.image = `https://images-na.ssl-images-amazon.com/images/P/${asin[1]}.09.TZZZZZZZ.jpg`;
            }
          }

          return metaData;
        })
        .catch((e) => {
          console.error(e);
          return null;
        });
      return metas;
    })
  );

  const linksByUrl = linkDataList
    .filter(nonNullable)
    .reduce<Record<string, LinkData>>((acc, value) => {
      if (value.url === '') {
        return acc;
      }
      return {
        ...acc,
        [value.url]: {...value, image: value.image !== '' ? value.image : defaultThumbnailUrl},
      };
    }, {});

  return {
    props: {
      path: `/${params.category}/${params.path}`,
      category: currentCategory,
      withLinksCountCategories: LinksCount,
      article: item,
      lineId,
      defaultThumbnailUrl,
      logoUrl,
      linksByUrl,
    },
  };
};

const getStaticPaths: GetStaticPaths<Params> = async () => {
  const entries = await client.withoutUnresolvableLinks.getEntries<ArticleEntrySkeleton>({
    content_type: ContentType.Article,
  });
  const paths = entries.items.flatMap((item) => {
    const slug = item.fields.category?.fields.slug;
    return slug === undefined ? [] : [{params: {category: slug, path: item.fields.slug}}];
  });

  return {
    paths,
    fallback: false,
  };
};

const Article = ({
  path,
  title,
  date,
  breadCrumbs,
  imageSrc,
  imageWidth,
  imageHeight,
  contents,
  categories,
  linksByUrl,
  setting,
}: Props): JSX.Element => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <Seo title={title} />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath={path}
          logoUrl={setting.logoUrl}
        />
        <Box
          component="article"
          sx={{
            width: matches ? '900px' : undefined,
            padding: matches ? '48px 24px' : '48px 16px',
            margin: '0 auto',
          }}
        >
          <Grid css={{gridTemplateColumns: matches ? undefined : '1fr'}}>
            <div>
              {imageSrc !== undefined ? (
                <div>
                  <Image
                    src={`https:${imageSrc}`}
                    alt="thumbnail"
                    width={imageWidth}
                    height={imageHeight}
                  />
                </div>
              ) : null}
              <div>
                <BreadCrumbs breadCrumbs={breadCrumbs} />
              </div>
              <Typography
                variant="h1"
                sx={{
                  margin: '16px 0 8px',
                }}
              >
                {title}
              </Typography>
              <Typography variant="caption">{date}</Typography>
              {contents && (
                <Toc>
                  <TableOfContents contents={contents} />
                </Toc>
              )}
              {contents && (
                <BlogContent
                  contents={contents}
                  defaultThumbnailUrl={setting.defaultThumbnailUrl}
                  categoryLinks={categories}
                  linksByUrl={linksByUrl}
                />
              )}
              <Share path={path} title={title} lineId={setting.lineId} />
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

export type {ArticleContainerProps, ArticleProps};
export {getStaticProps, getStaticPaths};
export default ArticleContainer;
