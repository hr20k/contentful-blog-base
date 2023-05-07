import {createHash} from 'crypto';
import {ParsedUrlQuery} from 'querystring';

import {documentToReactComponents, RenderNode} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document, INLINES} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Grid, Typography, useMediaQuery} from '@mui/material';
import * as contentful from 'contentful';
import {Entry} from 'contentful';
import {GetStaticPaths, GetStaticProps} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import YouTube from 'react-youtube';

import {
  CategoryModel,
  ArticleModel,
  WithLinksCountCategory,
  SettingModel,
} from '@/api/contentful/models/blog';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {Share} from '@/components/molecules/Share';
import {SmallArticleCard} from '@/components/molecules/SmallArticleCard';
import {TableOfContents} from '@/components/molecules/TableOfContents';
import {ContentType, siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {formatJstDateString} from '@/utils';
import {client} from '@/utils/contentful';
import {withLinksCountToCategory} from '@/utils/server';

const Toc = styled.div({
  margin: '48px 0',
});

const Text = styled.p({
  lineHeight: '2',
});

const YouTubeEmbed = styled.div({
  margin: '24px 0',
  position: 'relative',
  width: '100%',
  paddingTop: '56.25%',
  ['& iframe']: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
  },
});

interface Params extends ParsedUrlQuery {
  category: string;
  path: string;
}

interface ArticleContainerProps {
  path: string;
  category: Entry<CategoryModel>;
  article: Entry<ArticleModel>;
  withLinksCountCategories: Array<WithLinksCountCategory>;
  blogSetting: Entry<SettingModel>;
}

interface ArticleProps {
  path: string;
  title: string;
  date: string;
  breadCrumbs: Array<BreadCrumbsModel>;
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  contents: Document | null;
  categories: Array<CategoryLink>;
  setting: {
    logoUrl: string;
    defaultThumbnailUrl: string;
    lineId?: string;
  };
}

type ContainerProps = ArticleContainerProps;

type Props = ArticleProps;

const ArticleContainer: React.FC<ContainerProps> = ({
  path,
  category,
  article,
  withLinksCountCategories,
  blogSetting,
}: ContainerProps) => {
  const breadCrumbs: Array<BreadCrumbsModel> = React.useMemo(() => {
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

  const categoryLinks = React.useMemo(
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
      imageWidth={article.fields.thumbnail?.fields.file.details.image?.width}
      imageHeight={article.fields.thumbnail?.fields.file.details.image?.height}
      contents={article.fields.contents}
      categories={categoryLinks}
      setting={{
        logoUrl: `https:${blogSetting.fields.logo.fields.file.url}`,
        defaultThumbnailUrl: `https:${blogSetting.fields.defaultThumbnail.fields.file.url}`,
        lineId: blogSetting.fields.lineId,
      }}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps, Params> = async ({params}) => {
  if (params?.path) {
    const settings = await client.getEntries<SettingModel>({
      content_type: ContentType.Setting,
    });
    const blogSetting = settings.items.pop();

    const categoryEntries = await client.getEntries<CategoryModel>({
      content_type: ContentType.Category,
      order: 'fields.order',
    });

    const LinksCount = await withLinksCountToCategory(categoryEntries);
    const currentCategory = categoryEntries.items.find(
      ({fields}) => fields.slug === params.category
    );

    const entry = await client.getEntries<ArticleModel>({
      content_type: ContentType.Article,
      'fields.slug': params.path,
      'fields.category.sys.contentType.sys.id': ContentType.Category,
      'fields.category.fields.slug': params.category,
      limit: 1,
    });
    const item = entry.items.shift();

    if (
      typeof item !== 'undefined' &&
      typeof currentCategory !== 'undefined' &&
      typeof blogSetting !== 'undefined'
    ) {
      return {
        props: {
          path: `/${params.category}/${params.path}`,
          category: currentCategory,
          withLinksCountCategories: LinksCount,
          article: item,
          blogSetting,
        },
      };
    }
  }

  return {
    notFound: true,
  };
};

const getStaticPaths: GetStaticPaths<Params> = async () => {
  const entries = await client.getEntries<ArticleModel>({
    content_type: ContentType.Article,
  });
  const paths = entries.items.map((item) => ({
    params: {
      category: item.fields.category.fields.slug,
      path: item.fields.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

const Article: React.FC<Props> = ({
  path,
  title,
  date,
  breadCrumbs,
  imageSrc,
  imageWidth,
  imageHeight,
  contents,
  categories,
  setting,
}: Props) => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const categoryMap = categories.reduce<Record<string, CategoryLink>>(
    (acc, value) => ({...acc, [value.id]: value}),
    {}
  );

  const renderNode: Record<
    string,
    (node: contentful.RichTextContent, children: React.ReactNode) => React.ReactNode
  > = {
    [BLOCKS.HEADING_2]: (node, children) => {
      const content = node.content?.slice(0, 1).shift();
      if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
        const anchor = createHash('md5').update(content.value).digest('hex');
        return (
          <Typography id={anchor} variant="h2" sx={{marginTop: '32px', marginBottom: '16px'}}>
            {children}
          </Typography>
        );
      }
      return children;
    },
    [BLOCKS.HEADING_3]: (node, children) => {
      const content = node.content?.slice(0, 1).shift();
      if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
        const anchor = createHash('md5').update(content.value).digest('hex');
        return (
          <Typography id={anchor} variant="h3" sx={{borderBottom: 'solid 2px', lineHeight: 2}}>
            {children}
          </Typography>
        );
      }
      return children;
    },
    [BLOCKS.HEADING_4]: (node, children) => {
      const content = node.content?.slice(0, 1).shift();
      if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
        const anchor = createHash('md5').update(content.value).digest('hex');
        return (
          <Typography id={anchor} variant="h4">
            {children}
          </Typography>
        );
      }
      return children;
    },
    [BLOCKS.HEADING_5]: (node, children) => {
      const content = node.content?.slice(0, 1).shift();
      if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
        const anchor = createHash('md5').update(content.value).digest('hex');
        return (
          <Typography id={anchor} variant="h5">
            {children}
          </Typography>
        );
      }
      return children;
    },
    [BLOCKS.HEADING_6]: (node, children) => {
      const content = node.content?.slice(0, 1).shift();
      if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
        const anchor = createHash('md5').update(content.value).digest('hex');
        return (
          <Typography id={anchor} variant="h6">
            {children}
          </Typography>
        );
      }
      return children;
    },
    [BLOCKS.PARAGRAPH]: (node, children) => {
      const content = node.content?.slice(0, 1).shift();
      if (content?.marks.find((x) => x.type === 'code')) {
        return (
          <div>
            <pre>
              <code>{children}</code>
            </pre>
          </div>
        );
      }
      if (content?.nodeType === 'text') {
        return <Text>{children}</Text>;
      }
      return <p>{children}</p>;
    },
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const fields = node.data.target.fields;

      return (
        <Box
          sx={{
            margin: '16px 0',
          }}
        >
          <Image
            src={`https:${fields.file.url}`}
            width={fields.file.details.image.width}
            height={fields.file.details.image.height}
            alt={fields.file.title}
          />
          {fields.description !== '' ? (
            <Typography variant="caption">{node.data.target.fields.description}</Typography>
          ) : null}
        </Box>
      );
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
      const title = node.data.target.fields.title ?? '';
      const categorySlug = categoryMap[node.data.target.fields.category.sys.id]?.path;
      const imageSrc =
        node.data.target.fields.thumbnail?.fields?.file?.url ?? setting.defaultThumbnailUrl;
      const slug = node.data.target.fields.slug;
      const createdAt = node.data.target.sys.createdAt;
      return (
        <SmallArticleCard
          title={title}
          href={`${categorySlug}/${slug}`}
          imageSrc={imageSrc}
          date={formatJstDateString(new Date(createdAt))}
        />
      );
    },
    [INLINES.EMBEDDED_ENTRY]: (node: any) => {
      const title = node.data.target.fields.title ?? '';
      const categorySlug = categoryMap[node.data.target.fields.category.sys.id]?.path;
      const slug = node.data.target.fields.slug;
      return <a href={`${categorySlug}/${slug}`}>{title}</a>;
    },
    [INLINES.HYPERLINK]: (node, children) => {
      if (
        node.nodeType === INLINES.HYPERLINK &&
        'uri' in node.data &&
        typeof node.data.uri === 'string'
      ) {
        const youtubeRe = /\/youtu.be\/(.+)$/;
        const matched = node.data.uri.match(youtubeRe);

        if (Array.isArray(matched) && matched.length >= 2) {
          return (
            <YouTubeEmbed>
              <YouTube videoId={matched[1]} />
            </YouTubeEmbed>
          );
        }

        const content = node.content?.slice(0, 1).shift();
        return (
          <Link href={node.data.uri} target="_blank" rel="noreferrer noopener">
            {content?.value ?? node.data.uri}
          </Link>
        );
      }
      return children;
    },
  };

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
            width: matches ? '900px' : 'auto',
            margin: matches ? '48px auto' : '48px 16px',
          }}
        >
          <Grid container spacing={5}>
            <Grid item sm={12} md={8}>
              {typeof imageSrc !== 'undefined' ? (
                <Box>
                  <Image
                    src={`https:${imageSrc}`}
                    alt="thumbnail"
                    width={imageWidth}
                    height={imageHeight}
                  />
                </Box>
              ) : null}
              <Box>
                <BreadCrumbs breadCrumbs={breadCrumbs} />
              </Box>
              <Typography
                variant="h1"
                sx={{
                  margin: '16px 0 8px',
                }}
              >
                {title}
              </Typography>
              <Typography variant="caption">{date}</Typography>
              <Toc>
                <TableOfContents contents={contents} />
              </Toc>
              <div>
                {contents !== null
                  ? documentToReactComponents(contents, {renderNode: renderNode as RenderNode})
                  : null}
              </div>
              <Share path={path} title={title} lineId={setting.lineId} />
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

export type {ArticleContainerProps, ArticleProps};
export {getStaticProps, getStaticPaths};
export default ArticleContainer;
