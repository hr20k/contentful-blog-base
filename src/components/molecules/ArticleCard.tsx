import styled from '@emotion/styled';
import {Box, Paper, Typography, Link as MuiLink} from '@mui/material';
import Link from 'next/link';
import * as React from 'react';

interface ArticleCardProps {
  href: string;
  imageSrc?: string;
  title: string;
  contents: string;
}

type Props = ArticleCardProps;

const Img = styled.img({
  objectFit: 'cover',
  borderTopLeftRadius: '4px',
  borderTopRightRadius: '4px',
});

const ArticleCard: React.FC<Props> = ({
  href,
  imageSrc,
  title,
  contents,
}) => {
  return (
    <Link href={href}>
      <MuiLink
        underline="none"
        sx={{
          cursor: 'pointer',
        }}
      >
        <Paper>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '480px',
            }}
          >
            <Box>
              <Img
                src={imageSrc ?? '/images/home.png'}
                width="100%"
                height="320px"
                loading='lazy'
              />
            </Box>
            <Box
              component="div"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                margin: '1rem',
              }}
            >
              <Typography
                variant='h2'
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  marginTop: '1rem',
                  display: '-webkit-box',
                  ['-webkit-box-orient']: 'vertical',
                  ['-webkit-line-clamp']: '3',
                  overflow: 'hidden',
                }}
              >
                {contents}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </MuiLink>
    </Link>
  );
};

export type {ArticleCardProps};
export {ArticleCard};
