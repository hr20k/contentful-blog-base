import {ParsedUrlQuery} from 'querystring';

import {
  documentToReactComponents,
  Options,
} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document} from '@contentful/rich-text-types';
import {Box, Typography} from '@mui/material';
import * as contentful from 'contentful';
import {GetStaticPaths, GetStaticProps} from 'next';
import * as React from 'react';

import {TechBlogModel} from '@/api/contentful/models/techBlog';
import {Header} from '@/components/molecules/Header';
import {Share} from '@/components/molecules/Share';


interface Params extends ParsedUrlQuery {
  path: string;
}

interface ArticleContainerProps {
  path: string;
  article: contentful.Entry<TechBlogModel>;
}

interface ArticleProps {
  path: string;
  title: string;
  contents: Document | null;
}

type ContainerProps = ArticleContainerProps;

type Props = ArticleProps;

const ArticleContainer: React.FC<ContainerProps> = ({
  path,
  article,
}: ContainerProps) => {
  return (
    <Article
      path={path}
      title={article.fields.title}
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

    const entry = await client.getEntries<TechBlogModel>({
      'content_type': 'techBlog',
      'fields.slug': params.path,
      'limit': 1,
    });
    const item = entry.items.shift();

    if (typeof item !== 'undefined') {
      return {
        props: {
          path: params.path,
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
  const entries = await client.getEntries<TechBlogModel>();
  const paths = entries.items.map((item) => ({
    params: {
      path: item.fields.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

const Article: React.FC<Props> = ({path, title, contents}: Props) => {
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
          width: '640px',
          margin: '48px auto',
        }}
      >
        <Typography variant='h1'>
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
