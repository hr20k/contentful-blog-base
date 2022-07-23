import {createHash} from 'crypto';
import {ParsedUrlQuery} from 'querystring';

import {documentToReactComponents, Options} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document, INLINES} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Grid, Typography, useMediaQuery} from '@mui/material';
import * as contentful from 'contentful';
import {format} from 'date-fns';
import {GetStaticPaths, GetStaticProps} from 'next';
import Image from 'next/image';
import * as React from 'react';
import YouTube from 'react-youtube';

import {
  CategoryModel,
  TechBlogModel,
  WithLinksCountCategory,
} from '@/api/contentful/models/techBlog';
import {Seo} from '@/components/atoms/Seo';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {Share} from '@/components/molecules/Share';
import {TableOfContents} from '@/components/molecules/TableOfContents';
import {ContentType, siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils';

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
  category: contentful.Entry<CategoryModel>;
  article: contentful.Entry<TechBlogModel>;
  withLinksCountCategories: Array<WithLinksCountCategory>;
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
}

type ContainerProps = ArticleContainerProps;

type Props = ArticleProps;

const ArticleContainer: React.FC<ContainerProps> = ({
  path,
  category,
  article,
  withLinksCountCategories,
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
      })),
    [withLinksCountCategories]
  );

  return (
    <Article
      path={path}
      title={article.fields.title}
      date={`${format(new Date(article.sys.createdAt), 'yyyy年MM月dd日 HH:mm')}`}
      breadCrumbs={breadCrumbs}
      imageSrc={article.fields.thumbnail?.fields.file?.url}
      imageWidth={article.fields.thumbnail?.fields.file.details.image?.width}
      imageHeight={article.fields.thumbnail?.fields.file.details.image?.height}
      contents={article.fields.contents}
      categories={categoryLinks}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps, Params> = async ({params}) => {
  if (params?.path) {
    const client = contentful.createClient({
      space: process.env.CONTENTFUL_SPACE_ID ?? '',
      accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
    });

    const categoryEntries = await client.getEntries<CategoryModel>({
      content_type: ContentType.Category,
      order: 'fields.order',
    });

    const Linkscount = await withLinksCountToCategory(categoryEntries);
    const currentCategory = categoryEntries.items.find(
      ({fields}) => fields.slug === params.category
    );

    const entry = await client.getEntries<TechBlogModel>({
      content_type: ContentType.Article,
      'fields.slug': params.path,
      'fields.category.sys.contentType.sys.id': ContentType.Category,
      'fields.category.fields.slug': params.category,
      limit: 1,
    });
    const item = entry.items.shift();

    if (typeof item !== 'undefined' && typeof currentCategory !== 'undefined') {
      return {
        props: {
          path: `/${params.category}/${params.path}`,
          category: currentCategory,
          withLinksCountCategories: Linkscount,
          article: item,
        },
      };
    }
  }

  return {
    notFound: true,
  };
};

const getStaticPaths: GetStaticPaths<Params> = async () => {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
  });
  const entries = await client.getEntries<TechBlogModel>({
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
}: Props) => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const options: Options = {
    renderNode: {
      [BLOCKS.HEADING_2]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
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
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          return (
            <Typography
              variant="h3"
              sx={{borderBottom: 'solid 2px', lineHeight: 2, fontWeight: '500'}}
            >
              {children}
            </Typography>
          );
        }
        return children;
      },
      [BLOCKS.HEADING_4]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          return <Typography variant="h4">{children}</Typography>;
        }
        return children;
      },
      [BLOCKS.HEADING_5]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          return <Typography variant="h5">{children}</Typography>;
        }
        return children;
      },
      [BLOCKS.HEADING_6]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (content?.nodeType === 'text') {
          return <Typography variant="h6">{children}</Typography>;
        }
        return children;
      },
      [BLOCKS.PARAGRAPH]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (
          typeof content !== 'undefined' &&
          'marks' in content &&
          content.marks.find((x) => x.type === 'code')
        ) {
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
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        return (
          <Box
            sx={{
              margin: '16px 0',
            }}
          >
            <Image
              src={`https:${node.data.target.fields.file.url}`}
              width={node.data.target.fields.file.details.image.width}
              height={node.data.target.fields.file.details.image.height}
              alt={node.data.target.fields.title}
            />
            {'fields' in node.data.target &&
            'description' in node.data.target.fields &&
            node.data.target.fields.description !== '' ? (
              <Typography variant="caption">{node.data.target.fields.description}</Typography>
            ) : null}
          </Box>
        );
      },
      [INLINES.HYPERLINK]: (node, children) => {
        const youtubeRe = /\/youtu.be\/(.+)$/;
        const matched = node.data.uri.match(youtubeRe);

        if (Array.isArray(matched) && matched.length >= 2) {
          return (
            <YouTubeEmbed>
              <YouTube videoId={matched[1]} />
            </YouTubeEmbed>
          );
        }

        if (
          node.nodeType === INLINES.HYPERLINK &&
          'uri' in node.data &&
          typeof node.data.uri === 'string'
        ) {
          return <a href={node.data.uri}>{node.data.uri}</a>;
        }
        return children;
      },
    },
  };

  return (
    <>
      <Seo title={title} />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath={path}
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
              <div>{contents !== null ? documentToReactComponents(contents, options) : null}</div>
              <Share path={path} title={title} />
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
