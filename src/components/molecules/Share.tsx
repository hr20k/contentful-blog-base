import styled from '@emotion/styled';
import {Box, Stack} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import {
  TwitterShareButton,
  FacebookShareButton,
  LineShareButton,
  HatenaShareButton,
  TwitterIcon,
  FacebookIcon,
  LineIcon,
  HatenaIcon,
} from 'react-share';

import {siteTitle, siteUrl} from '@/constants';

interface ShareProps {
  path?: string;
  title?: string;
  lineId: string | null;
}

type Props = ShareProps;

const Share = ({path = '', title, lineId}: Props): JSX.Element => {
  const url = `${siteUrl}${path}`;
  const displayTitle = typeof title !== 'undefined' ? `${title} | ${siteTitle}` : siteTitle;

  const ShareButton = styled(Box)({
    marginLeft: '1rem',
    ['&:first-of-type']: {
      marginLeft: 0,
    },
  });

  return (
    <Stack height="200px" alignItems="center" justifyContent="center" gap="1rem">
      {lineId !== null && (
        <Box>
          <Link href="https://lin.ee/GzwmJX8" passHref>
            <Image
              src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
              alt="友だち追加"
              height="36"
              width="116"
            />
          </Link>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ShareButton>
          <TwitterShareButton url={url} title={displayTitle}>
            <TwitterIcon size={30} round={true} />
          </TwitterShareButton>
        </ShareButton>

        <ShareButton>
          <FacebookShareButton url={url} title={displayTitle}>
            <FacebookIcon size={30} round={true} />
          </FacebookShareButton>
        </ShareButton>

        <ShareButton>
          <LineShareButton url={url} title={displayTitle}>
            <LineIcon size={30} round={true} />
          </LineShareButton>
        </ShareButton>

        <ShareButton>
          <HatenaShareButton url={url} title={displayTitle}>
            <HatenaIcon size={30} round={true} />
          </HatenaShareButton>
        </ShareButton>
      </Box>
    </Stack>
  );
};

export {Share};
