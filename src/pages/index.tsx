import {Block, Document, Inline} from '@contentful/rich-text-types';
import {Box, useMediaQuery} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {format} from 'date-fns';
import {GetStaticProps} from 'next';
import Head from 'next/head';
import * as React from 'react';

import {TechBlogModel} from '@/api/contentful/models/techBlog';
import {theme} from '@/styles/theme/theme';

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
    date: string;
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
    fields: {title, slug, thumbnail, category, contents},
    sys: {createdAt},
  }) => {
    return {
      href: `/${category.fields.slug}/${slug}`,
      imageSrc: thumbnail?.fields.file.url,
      title,
      date: `${format(new Date(createdAt), 'yyyy年MM月dd日 HH:mm')}`,
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
  });

  return {
    props: {
      articles: entry.items,
    },
  };
};

const Home: React.FC<Props> = ({links}) => {
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

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
            width: matches ? '640px' : 'auto',
            margin: matches ? '48px auto' : '48px 16px',
          }}
        >
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
        </Box>
      </main>
    </div>
  );
};

export type {HomeContainerProps, HomeProps};
export {getStaticProps};
export default HomeContainer;
