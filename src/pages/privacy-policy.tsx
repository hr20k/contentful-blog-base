import {createHash} from 'crypto';

import {documentToReactComponents, Options} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Grid, Typography, useMediaQuery} from '@mui/material';
import {createClient, Entry} from 'contentful';
import {GetStaticProps} from 'next';
import {FC, useMemo} from 'react';

import {
  CategoryModel,
  PrivacyPolicyModel,
  SettingModel,
  WithLinksCountCategory,
} from '@/api/contentful/models/blog';
import {PrivacyPolicyLink} from '@/components/atoms/PrivacyPolicyLink';
import {Seo} from '@/components/atoms/Seo';
import {BreadCrumbs} from '@/components/molecules/BreadCrumbs';
import {CategoryLinkList} from '@/components/molecules/CategoryLinkList';
import {NavHeader} from '@/components/molecules/NavHeader';
import {ContentType, siteTitle} from '@/constants';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {theme} from '@/styles/theme/theme';
import {withLinksCountToCategory} from '@/utils';

const Text = styled.p({
  lineHeight: '2',
});

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.CONTENTFUL_ACCESS_KEY ?? '',
});

interface PrivacyPolicyContainerProps {
  withLinksCountCategories: Array<WithLinksCountCategory>;
  privacyPolicyDoc: Entry<PrivacyPolicyModel>;
  blogSetting: Entry<SettingModel>;
}

interface PrivacyPolicyProps {
  breadCrumbs: Array<BreadCrumbsModel>;
  categories: Array<CategoryLink>;
  contents: Document | null;
  setting: {
    logoUrl: string;
  };
}

type ContainerProps = PrivacyPolicyContainerProps;
type Props = PrivacyPolicyProps;

const PrivacyPolicyContainer: FC<ContainerProps> = ({
  withLinksCountCategories,
  privacyPolicyDoc,
  blogSetting,
}) => {
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
      setting={{
        logoUrl: `https:${blogSetting.fields.logo.fields.file.url}`,
      }}
    />
  );
};

const getStaticProps: GetStaticProps<ContainerProps> = async () => {
  const settings = await client.getEntries<SettingModel>({
    content_type: ContentType.Setting,
  });
  const blogSetting = settings.items.pop();

  const categoryEntries = await client.getEntries<CategoryModel>({
    content_type: ContentType.Category,
    order: 'fields.order',
  });
  const LinksCount = await withLinksCountToCategory(categoryEntries);

  const entry = await client.getEntries<PrivacyPolicyModel>({
    content_type: ContentType.PrivacyPolicy,
    limit: 1,
  });
  const item = entry.items.shift();

  if (typeof item === 'undefined' || typeof blogSetting === 'undefined') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      withLinksCountCategories: LinksCount,
      privacyPolicyDoc: item,
      blogSetting,
    },
  };
};

const PrivacyPolicy: FC<Props> = ({categories, breadCrumbs, contents, setting}) => {
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
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <Typography id={anchor} variant="h3" sx={{borderBottom: 'solid 2px', lineHeight: 2}}>
              {children}
            </Typography>
          );
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
    },
  };

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
          <Grid container spacing={5}>
            <Grid item sm={12} md={8}>
              <Box>
                <BreadCrumbs breadCrumbs={breadCrumbs} />
              </Box>
              <Typography
                variant="h1"
                sx={{
                  margin: '8px 0',
                }}
              >
                プライバシーポリシー
              </Typography>
              <Box>{contents !== null ? documentToReactComponents(contents, options) : null}</Box>
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

export {getStaticProps};
export default PrivacyPolicyContainer;
