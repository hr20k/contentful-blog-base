import {ParsedUrlQuery} from 'querystring';


import {
  documentToReactComponents,
  Options,
} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Grid, Typography, useMediaQuery} from '@mui/material';
import * as contentful from 'contentful';
import {format} from 'date-fns';
import {GetStaticPaths, GetStaticProps} from 'next';
import * as React from 'react';

import {
  CategoryModel,
  TechBlogModel,
  WithLinksCountCategory,
} from '@/api/contentful/models/techBlog';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {Header} from '@/components/molecules/Header';
import {Share} from '@/components/molecules/Share';
import {siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils';


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
  }, []);

  const categoryLinks = React.useMemo(() =>
    withLinksCountCategories.map(({category, count}) => ({
      title: category.fields.name,
      count,
      path: `/${category.fields.slug}`,
    })), [withLinksCountCategories]);


  return (
    <Article
      path={path}
      title={article.fields.title}
      date={`${format(new Date(article.sys.createdAt), 'yyyy年MM月dd日 HH:mm')}`}
      breadCrumbs={breadCrumbs}
      imageSrc={article.fields.thumbnail?.fields.file?.url}
      contents={article.fields.contents}
      categories={categoryLinks}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps, Params> = async ({
  params,
}) => {
  if (params?.path) {
    const client = contentful.createClient({
      space: process.env.CONTENTFUL_SPACE_ID ?? '',
      accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
    });

    const categoryEntries = await client.getEntries<CategoryModel>({
      'content_type': 'category',
    });
    const Linkscount = await withLinksCountToCategory(categoryEntries);
    const currentCategory = categoryEntries.items.find(({fields}) =>
      fields.slug === params.category,
    );

    const entry = await client.getEntries<TechBlogModel>({
      'content_type': 'techBlog',
      'fields.slug': params.path,
      'fields.category.sys.contentType.sys.id': 'category',
      'fields.category.fields.slug': params.category,
      'limit': 1,
    });
    const item = entry.items.shift();

    if (typeof item !== 'undefined' && typeof currentCategory !== 'undefined') {
      return {
        props: {
          path: params.path,
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
    'content_type': 'techBlog',
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
  contents,
  categories,
}: Props) => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const Img = styled.img({
    objectFit: 'cover',
    borderRadius: '4px',
  });

  const options: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => {
        const content = node.content.slice(0, 1).shift();
        if (
          typeof content !== 'undefined' &&
          'marks' in content &&
          content.marks.find((x) => x.type === 'code')
        ) {
          return <div><pre><code>{children}</code></pre></div>;
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
            <img
              src={node.data.target.fields.file.url}
              width="100%"
              object-fit="cover"
              alt={node.data.target.fields.title}
              loading='lazy'
            />
            {'fields' in node.data.target &&
              'description' in node.data.target.fields &&
              node.data.target.fields.description !== '' ? (
              <Typography
                variant="caption"
              >
                {node.data.target.fields.description}
              </Typography>
            ): null}
          </Box>
        );
      },
    },
  };

  return (
    <main>
      <Header />
      <Box
        component='article'
        sx={{
          width: matches ? '900px' : 'auto',
          margin: matches ? '48px auto' : '48px 16px',
        }}
      >
        <Grid container spacing={5}>
          <Grid item sm={12} md={8}>
            {typeof imageSrc !== 'undefined' ? (
          <Box>
            <Img
              src={imageSrc}
              alt='thumbnail'
              width="100%"
              height={
                matches ? '320px' : 'calc((100vw - 32px) * (320 / 640))'
              }
              loading='lazy'
            />
          </Box>
         ) : null}
            <Box>
              <BreadCrumbs breadCrumbs={breadCrumbs}/>
            </Box>
            <Typography
              variant='h1'
              sx={{
                margin: '8px 0',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant='caption'
            >
              {date}
            </Typography>
            <div>
              {contents !== null ?
          documentToReactComponents(contents, options) :
           null}
            </div>
            <Share path={path} title={title}/>
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
  );
};

export type {ArticleContainerProps, ArticleProps};
export {getStaticProps, getStaticPaths};
export default ArticleContainer;
