import styled from '@emotion/styled';
import {Box, Paper, Typography, Link as MuiLink, Grid} from '@mui/material';
import Link from 'next/link';
import * as React from 'react';

interface SmallArticleCardProps {
  href: string;
  imageSrc: string;
  title: string;
  date: string;
}

type Props = SmallArticleCardProps;

const Img = styled.img({
  objectFit: 'cover',
  borderRadius: '4px',
});

const SmallArticleCard: React.FC<Props> = ({href, imageSrc, title, date}) => {
  return (
    <Link href={href} passHref legacyBehavior>
      <MuiLink
        underline="none"
        sx={{
          cursor: 'pointer',
        }}
      >
        <Paper>
          <Grid container minHeight="83px">
            <Grid item xs={4}>
              <Img src={imageSrc} alt={title} width="100%" loading="lazy" />
            </Grid>
            <Grid item xs paddingLeft={2}>
              <Box
                component="div"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: '3',
                    overflow: 'hidden',
                    fontSize: '0.875rem',
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    marginTop: '8px',
                  }}
                >
                  {date}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </MuiLink>
    </Link>
  );
};

export type {SmallArticleCardProps};
export {SmallArticleCard};
