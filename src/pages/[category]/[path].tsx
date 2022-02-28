import {ParsedUrlQuery} from 'querystring';

import {
  documentToReactComponents,
  Options,
} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Typography, useMediaQuery} from '@mui/material';
import * as contentful from 'contentful';
import {GetStaticPaths, GetStaticProps} from 'next';
import * as React from 'react';

import {CategoryModel, TechBlogModel} from '@/api/contentful/models/techBlog';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {Header} from '@/components/molecules/Header';
import {Share} from '@/components/molecules/Share';
import {siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {theme} from '@/styles/theme/theme';


interface Params extends ParsedUrlQuery {
  category: string;
  path: string;
}

interface ArticleContainerProps {
  path: string;
  category: contentful.Entry<CategoryModel>;
  article: contentful.Entry<TechBlogModel>;
}

interface ArticleProps {
  path: string;
  title: string;
  breadCrumbs: Array<BreadCrumbsModel>;
  imageSrc?: string;
  contents: Document | null;
}

type ContainerProps = ArticleContainerProps;

type Props = ArticleProps;

const ArticleContainer: React.FC<ContainerProps> = ({
  path,
  category,
  article,
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

  return (
    <Article
      path={path}
      breadCrumbs={breadCrumbs}
      title={article.fields.title}
      imageSrc={article.fields.thumbnail?.fields.file?.url}
      contents={article.fields.contents}
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

    const categoryEntry = await client.getEntries<CategoryModel>({
      'content_type': 'category',
      'fields.slug': params.category,
      'limit': 1,
    });
    const category = categoryEntry.items.shift();

    const entry = await client.getEntries<TechBlogModel>({
      'content_type': 'techBlog',
      'fields.slug': params.path,
      'fields.category.sys.contentType.sys.id': 'category',
      'fields.category.fields.slug': params.category,
      'limit': 1,
    });
    const item = entry.items.shift();

    if (typeof item !== 'undefined' && typeof category !== 'undefined') {
      return {
        props: {
          path: params.path,
          category,
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
  breadCrumbs,
  imageSrc,
  contents,
}: Props) => {
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const Img = styled.img({
    marginTop: '48px',
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
          width: matches ? '640px' : 'auto',
          margin: matches ? '0 auto 48px' : '0 16px 48px',
        }}
      >
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
        <BreadCrumbs breadCrumbs={breadCrumbs}/>
        <Typography
          variant='h1'
          sx={{
            marginTop: '48px',
            marginBottom: '8px',
          }}
        >
          {title}
        </Typography>
        <div>
          {contents !== null ?
          documentToReactComponents(contents, options) :
           null}
        </div>
        <Share path={path} title={title}/>
      </Box>
    </main>
  );
};

export type {ArticleContainerProps, ArticleProps};
export {getStaticProps, getStaticPaths};
export default ArticleContainer;
