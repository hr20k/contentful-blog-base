import {Block, Document, Inline} from '@contentful/rich-text-types';
import {Box} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {GetStaticProps} from 'next';
import Head from 'next/head';
import * as React from 'react';

import {TechBlogModel} from '@/api/contentful/models/techBlog';

import {ArticleCard} from '../components/molecules/ArticleCard';
import {Header} from '../components/molecules/Header';


interface HomeContainerProps {
  articles: Array<Entry<TechBlogModel>>;
}

interface HomeProps {
  links: Array<{
    href: string;
    imageSrc?: string;
    title: string;
    contents: string;
  }>;
}

type ContainerProps = HomeContainerProps;

type Props = HomeProps;

const HomeContainer: React.FC<ContainerProps> = ({
  articles,
}) => {
  const getValue = (content: Block | Inline): string => {
    return content.content.map((c) => {
      if (c.nodeType === 'text') {
        return c.value;
      }
      return getValue(c);
    }).join('');
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

  const links = React.useMemo(() => articles.map(({
    fields: {title, slug, thumbnail, contents},
  }) => {
    return {
      href: `/article/${slug}`,
      imageSrc: thumbnail?.fields.file.url,
      title,
      contents: createContentsStr(contents),
    };
  }), [articles]);

  return <Home links={links}/>;
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
  });

  const entry = await client.getEntries<TechBlogModel>({
    'content_type': 'techBlog',
    'limit': 10,
  });

  return {
    props: {
      articles: entry.items,
    },
  };
};

const Home: React.FC<Props> = ({links}) => {
  return (
    <div>
      <Head>
        <title>Tech Blog</title>
        <meta name="description" content="フロントエンドの技術的なことを書くブログです" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <Box
          sx={{
            width: '640px',
            margin: '48px auto',
          }}
        >
          {links.map(({href, title, imageSrc, contents}) => (
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
                imageSrc={imageSrc}
                contents={contents}
              />
            </Box>
          ))}
        </Box>
      </main>
    </div>
  );
};

export type {HomeContainerProps, HomeProps};
export {getStaticProps};
export default HomeContainer;
