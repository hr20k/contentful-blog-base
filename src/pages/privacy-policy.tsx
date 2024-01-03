import {Document} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Typography, useMediaQuery} from '@mui/material';
import {Entry} from 'contentful';
import {GetStaticProps} from 'next';
import {useMemo} from 'react';

import {PrivacyPolicyEntrySkeleton, WithLinksCountCategory} from '@/api/contentful/models/blog';
import {getCategories} from '@/api/contentful/models/category';
import {getPrivacyPolicy} from '@/api/contentful/models/privacyPolicy';
import {getSetting} from '@/api/contentful/models/setting';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {BlogContent} from '@/components/molecules/BlogContent';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {TableOfContents} from '@/components/molecules/TableOfContents';
import {siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils/server';

const Toc = styled.div({
  margin: '48px 0',
});

const Grid = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 270px',
  gridGap: '40px',
});

interface PrivacyPolicyContainerProps {
  withLinksCountCategories: Array<WithLinksCountCategory>;
  privacyPolicyDoc: Entry<PrivacyPolicyEntrySkeleton, undefined, string>;
  defaultThumbnailUrl: string;
  logoUrl: string;
}

interface PrivacyPolicyProps {
  breadCrumbs: Array<BreadCrumbsModel>;
  categories: Array<CategoryLink>;
  contents?: Document;
  setting: {
    defaultThumbnailUrl: string;
    logoUrl: string;
  };
}

type ContainerProps = PrivacyPolicyContainerProps;
type Props = PrivacyPolicyProps;

const PrivacyPolicyContainer = ({
  withLinksCountCategories,
  privacyPolicyDoc,
  defaultThumbnailUrl,
  logoUrl,
}: ContainerProps): JSX.Element => {
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

  const breadCrumbs: Array<BreadCrumbsModel> = useMemo(() => {
    return [
      {
        href: '/',
        displayName: siteTitle,
      },
      {
        href: '/privacy-policy',
        displayName: 'プライバシーポリシー',
      },
    ];
  }, []);

  return (
    <PrivacyPolicy
      categories={categoryLinks}
      breadCrumbs={breadCrumbs}
      contents={privacyPolicyDoc.fields.contents}
      setting={{logoUrl, defaultThumbnailUrl}}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const {logoUrl, defaultThumbnailUrl} = await getSetting();
  const categoryEntries = await getCategories();
  const LinksCount = await withLinksCountToCategory(categoryEntries);
  const item = await getPrivacyPolicy();

  if (item === undefined || defaultThumbnailUrl === undefined || logoUrl === undefined) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      withLinksCountCategories: LinksCount,
      privacyPolicyDoc: item,
      defaultThumbnailUrl,
      logoUrl,
    },
  };
};

const PrivacyPolicy = ({categories, breadCrumbs, contents, setting}: Props): JSX.Element => {
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <Seo title="プライバシーポリシー" />
      <main>
        <NavHeader
          items={categories.map(({title, path}) => ({id: path, href: path, label: title}))}
          currentPath="/privacy-policy"
          logoUrl={setting.logoUrl}
        />
        <Box
          sx={{
            width: matches ? '900px' : 'auto',
            margin: matches ? '48px auto 48px' : '48px 16px',
          }}
        >
          <Grid css={{gridTemplateColumns: matches ? undefined : '1fr'}}>
            <div>
              <div>
                <BreadCrumbs breadCrumbs={breadCrumbs} />
              </div>
              <Typography
                variant="h1"
                sx={{
                  margin: '8px 0',
                }}
              >
                プライバシーポリシー
              </Typography>
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
                  linksByUrl={{}}
                />
              )}
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
export default PrivacyPolicyContainer;
