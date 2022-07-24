import styled from '@emotion/styled';
import {Box} from '@mui/material';
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
}

type Props = ShareProps;

const Share: React.FC<Props> = ({path = '', title}) => {
  const url = `${siteUrl}${path}`;
  const displayTitle = typeof title !== 'undefined' ? `${title} | ${siteTitle}` : siteTitle;

  const ShareButton = styled(Box)({
    marginLeft: '1rem',
    ['&:first-of-type']: {
      marginLeft: 0,
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
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
  );
};

export {Share};
