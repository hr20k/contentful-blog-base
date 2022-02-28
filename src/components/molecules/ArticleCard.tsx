import styled from '@emotion/styled';
import {
  Box,
  Paper,
  Typography,
  Link as MuiLink,
  useMediaQuery,
} from '@mui/material';
import Link from 'next/link';
import * as React from 'react';

import {theme} from '@/styles/theme/theme';

interface ArticleCardProps {
  href: string;
  imageSrc?: string;
  title: string;
  date: string;
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
  date,
  contents,
}) => {
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Link href={href} passHref>
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
            }}
          >
            <Box>
              <Img
                src={imageSrc ?? '/images/home.png'}
                alt="article-image"
                width="100%"
                height={
                  matches ? '320px' : 'calc((100vw - 32px) * (320 / 640))'
                }
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
              <Typography
                variant='caption'
                sx={{
                  marginTop: '8px',
                }}
              >
                {date}
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
