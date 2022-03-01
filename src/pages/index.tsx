import {Block, Document, Inline} from '@contentful/rich-text-types';
import {
  Box,
  Grid,
  useMediaQuery,
} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {format} from 'date-fns';
import {GetStaticProps} from 'next';
import Head from 'next/head';
import * as React from 'react';

import {
  CategoryModel,
  TechBlogModel,
  WithLinksCountCategory,
} from '@/api/contentful/models/techBlog';
import {ArticleCard} from '@/components/molecules/ArticleCard';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {Header} from '@/components/molecules/Header';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils';


interface HomeContainerProps {
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<TechBlogModel>>;
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
}

type ContainerProps = HomeContainerProps;

type Props = HomeProps;

const HomeContainer: React.FC<ContainerProps> = ({
  withLinksCountCategories,
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

  const categoryLinks = React.useMemo(() =>
    withLinksCountCategories.map(({category, count}) => ({
      title: category.fields.name,
      count,
      path: `/${category.fields.slug}`,
    })), [withLinksCountCategories]);

  return <Home links={links} categories={categoryLinks}/>;
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID ?? '',
    accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
  });

  const entry = await client.getEntries<TechBlogModel>({
    'content_type': 'techBlog',
  });
  const categoryEntries = await client.getEntries<CategoryModel>({
    'content_type': 'category',
  });
  const Linkscount = await withLinksCountToCategory(categoryEntries);

  return {
    props: {
      withLinksCountCategories: Linkscount,
      articles: entry.items,
    },
  };
};

const Home: React.FC<Props> = ({links, categories}) => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

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
    </div>
  );
};

export type {HomeContainerProps, HomeProps};
export {getStaticProps};
export default HomeContainer;
