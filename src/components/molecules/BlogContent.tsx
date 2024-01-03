import {createHash} from 'crypto';

import {Options, documentToReactComponents} from '@contentful/rich-text-react-renderer';
import {BLOCKS, Document, INLINES} from '@contentful/rich-text-types';
import styled from '@emotion/styled';
import {Box, Typography} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import YouTube from 'react-youtube';

import {LinkCard} from '@/components/molecules/LinkCard';
import {SmallArticleCard} from '@/components/molecules/SmallArticleCard';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {formatJstDateString} from '@/utils';

const Text = styled.p({
  lineHeight: '2',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
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

interface LinkData {
  url: string;
  title: string;
  description: string;
  image: string;
}

interface Props {
  contents: Document;
  defaultThumbnailUrl: string;
  linksByUrl: Record<string, LinkData>;
  categoryLinks: Array<CategoryLink>;
}

export const BlogContent = ({
  contents,
  defaultThumbnailUrl,
  linksByUrl,
  categoryLinks,
}: Props): JSX.Element => {
  const categoryMap = categoryLinks.reduce<Record<string, CategoryLink>>(
    (acc, value) => ({...acc, [value.id]: value}),
    {}
  );

  const options: Options = {
    renderNode: {
      [BLOCKS.HEADING_2]: (node, children) => {
        const content = node.content?.at(0);
        if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
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
        const content = node.content?.at(0);
        if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <Typography id={anchor} variant="h3" sx={{borderBottom: 'solid 2px', lineHeight: 2}}>
              {children}
            </Typography>
          );
        }
        return children;
      },
      [BLOCKS.HEADING_4]: (node, children) => {
        const content = node.content?.at(0);
        if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <Typography id={anchor} variant="h4">
              {children}
            </Typography>
          );
        }
        return children;
      },
      [BLOCKS.HEADING_5]: (node, children) => {
        const content = node.content?.at(0);
        if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <Typography id={anchor} variant="h5">
              {children}
            </Typography>
          );
        }
        return children;
      },
      [BLOCKS.HEADING_6]: (node, children) => {
        const content = node.content?.at(0);
        if (content?.nodeType === 'text' && typeof content.value !== 'undefined') {
          const anchor = createHash('md5').update(content.value).digest('hex');
          return (
            <Typography id={anchor} variant="h6">
              {children}
            </Typography>
          );
        }
        return children;
      },
      [BLOCKS.PARAGRAPH]: (node, children) => {
        const content = node.content?.at(0);
        if (content?.nodeType === 'text') {
          if (content.marks.find((x) => x.type === 'code')) {
            return (
              <div>
                <pre>
                  <code>{children}</code>
                </pre>
              </div>
            );
          }

          // TODO: iframe の表示方法で別の良い手段があれば置き換える
          const iFrameRegex = /<iframe\s+[^>]*src="([^"]*)"[^>]*>(?:<\/iframe>)?/i;
          if (content.value && iFrameRegex.test(content.value)) {
            return <div dangerouslySetInnerHTML={{__html: content.value}} />;
          }
          return typeof content.value === 'string' && content.value !== '' ? (
            <Text>{children}</Text>
          ) : (
            children
          );
        }
        return children;
      },
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const fields = node.data.target.fields;

        return (
          <Box
            sx={{
              margin: '16px 0',
            }}
          >
            <Image
              src={`https:${fields.file.url}`}
              width={fields.file.details.image.width}
              height={fields.file.details.image.height}
              alt={fields.file.title}
            />
            {fields.description !== '' ? (
              <Typography variant="caption">{node.data.target.fields.description}</Typography>
            ) : null}
          </Box>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        const title = node.data.target.fields.title ?? '';
        const categorySlug = categoryMap[node.data.target.fields.category.sys.id]?.path;
        const imageSrc =
          node.data.target.fields.thumbnail?.fields?.file?.url ?? defaultThumbnailUrl;
        const slug = node.data.target.fields.slug;
        const createdAt = node.data.target.sys.createdAt;
        return (
          <SmallArticleCard
            title={title}
            href={`${categorySlug}/${slug}`}
            imageSrc={imageSrc}
            date={formatJstDateString(new Date(createdAt))}
          />
        );
      },
      [INLINES.EMBEDDED_ENTRY]: (node: any) => {
        const title = node.data.target.fields.title ?? '';
        const categorySlug = categoryMap[node.data.target.fields.category.sys.id]?.path;
        const slug = node.data.target.fields.slug;
        return <a href={`${categorySlug}/${slug}`}>{title}</a>;
      },
      [INLINES.HYPERLINK]: (node, children) => {
        if (
          node.nodeType === INLINES.HYPERLINK &&
          'uri' in node.data &&
          typeof node.data.uri === 'string'
        ) {
          const youtubeRe = /\/youtu.be\/(.+)$/;
          const matched = node.data.uri.match(youtubeRe);

          if (Array.isArray(matched) && matched.length >= 2) {
            return (
              <YouTubeEmbed>
                <YouTube videoId={matched[1]} />
              </YouTubeEmbed>
            );
          }
          if (typeof linksByUrl[node.data.uri] !== 'undefined') {
            return <LinkCard {...linksByUrl[node.data.uri]} />;
          }

          const content = node.content?.at(0);
          return (
            <Link href={node.data.uri} target="_blank" rel="noreferrer noopener">
              {content?.nodeType === 'text' && content?.value ? node.data.uri : null}
            </Link>
          );
        }
        return children;
      },
    },
  };

  return <>{documentToReactComponents(contents, options)}</>;
};
