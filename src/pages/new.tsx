import {Block, Document, Inline} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, useMediaQuery} from '@mui/material';
import {Entry} from 'contentful';
import {GetStaticProps} from 'next';
import {useMemo} from 'react';

import {getNewArticles} from '@/api/contentful/models/article';
import {WithLinksCountCategory, ArticleEntrySkeleton} from '@/api/contentful/models/blog';
import {getCategories} from '@/api/contentful/models/category';
import {getSetting} from '@/api/contentful/models/setting';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {ArticleCard} from '@/components/molecules/ArticleCard';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {formatJstDateString} from '@/utils';
import {withLinksCountToCategory} from '@/utils/server';

const Grid = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 270px',
  gridGap: '40px',
});

interface NewContainerProps {
  withLinksCountCategories: Array<WithLinksCountCategory>;
  articles: Array<Entry<ArticleEntrySkeleton, 'WITHOUT_UNRESOLVABLE_LINKS', string>>;
  defaultThumbnailUrl: string;
  logoUrl: string;
}

interface NewProps {
  categories: Array<CategoryLink>;
  links: Array<{
    href: string;
    imageSrc: string;
    title: string;
    date: string;
    contents: string;
  }>;
  setting: {
    logoUrl: string;
  };
}

type ContainerProps = NewContainerProps;

type Props = NewProps;

const NewContainer = ({
  withLinksCountCategories,
  articles,
  defaultThumbnailUrl,
  logoUrl,
}: ContainerProps): JSX.Element => {
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

  const links = useMemo(
    () =>
      articles.map(({fields: {title, slug, thumbnail, category, contents}, sys: {createdAt}}) => {
        return {
          href: `/${category?.fields.slug}/${slug}`,
          imageSrc: thumbnail?.fields.file?.url ?? defaultThumbnailUrl,
          title,
          date: formatJstDateString(new Date(createdAt)),
          contents: contents ? createContentsStr(contents) : '',
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

  return <New links={links} categories={categoryLinks} setting={{logoUrl}} />;
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const {defaultThumbnailUrl, logoUrl} = await getSetting();

  const entry = await getNewArticles({limit: 10});
  const categoryEntries = await getCategories();
  const LinksCount = await withLinksCountToCategory(categoryEntries);

  if (defaultThumbnailUrl !== undefined && logoUrl !== undefined) {
    return {
      props: {
        withLinksCountCategories: LinksCount,
        articles: entry.items,
        defaultThumbnailUrl,
        logoUrl,
      },
    };
  }

  return {
    notFound: true,
  };
};

const New = ({links, categories, setting}: Props): JSX.Element => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <Seo title="新着記事" />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath="/"
          logoUrl={setting.logoUrl}
        />
        <Box
          sx={{
            width: matches ? '900px' : undefined,
            padding: matches ? '48px 24px' : '48px 16px',
            margin: '0 auto',
          }}
        >
          <Grid css={{gridTemplateColumns: matches ? undefined : '1fr'}}>
            <div>
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

export {getStaticProps};
export default NewContainer;
