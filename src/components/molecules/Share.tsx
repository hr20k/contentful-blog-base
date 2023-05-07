import styled from '@emotion/styled';
import {Box, Stack} from '@mui/material';
import Script from 'next/script';
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
  lineId?: string;
}

type Props = ShareProps;

const Share: React.FC<Props> = ({path = '', title, lineId}) => {
  const url = `${siteUrl}${path}`;
  const displayTitle = typeof title !== 'undefined' ? `${title} | ${siteTitle}` : siteTitle;

  const ShareButton = styled(Box)({
    marginLeft: '1rem',
    ['&:first-of-type']: {
      marginLeft: 0,
    },
  });

  return (
    <>
      <Script
        src="https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js"
        async
        defer
      ></Script>
      <Stack height="200px" alignItems="center" justifyContent="center" gap="1rem">
        {typeof lineId !== 'undefined' && (
          <Box>
            <div
              className="line-it-button"
              data-lang="ja"
              data-type="friend"
              data-env="REAL"
              data-lineId={lineId}
              style={{display: 'none'}}
            ></div>
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
    </>
  );
};

export {Share};
