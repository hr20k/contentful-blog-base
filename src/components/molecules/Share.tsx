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


const Share: React.FC = () => {
  const url = siteUrl;
  const title = siteTitle;

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
        <TwitterShareButton
          url={url}
          title={title}
        >
          <TwitterIcon size={30} round={true} />
        </TwitterShareButton>
      </ShareButton>

      <ShareButton>
        <FacebookShareButton
          url={url}
          title={title}
        >
          <FacebookIcon size={30} round={true} />
        </FacebookShareButton>
      </ShareButton>

      <ShareButton>
        <LineShareButton
          url={url}
          title={title}
        >
          <LineIcon size={30} round={true} />
        </LineShareButton>
      </ShareButton>

      <ShareButton>
        <HatenaShareButton
          url={url}
          title={title}
        >
          <HatenaIcon size={30} round={true} />
        </HatenaShareButton>
      </ShareButton>


    </Box>
  );
};

export {Share};
