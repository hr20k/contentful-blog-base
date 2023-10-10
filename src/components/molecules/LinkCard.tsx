import {Box, Link as MuiLink, Typography, useMediaQuery} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import {VFC} from 'react';

interface LinkCardProps {
  url: string;
  title: string;
  description: string;
  image: string;
}

const LinkCard: VFC<LinkCardProps> = ({description, image, title, url}) => {
  const matches = useMediaQuery('(max-width:600px)');
  return (
    <Link href={url} passHref legacyBehavior>
      <MuiLink
        target="_brank"
        underline="none"
        sx={{
          cursor: 'pointer',
          display: 'grid',
          gridTemplateColumns: matches
            ? 'repeat(3, minmax(0, 1fr));'
            : 'repeat(5, minmax(0, 1fr));',
          backgroundColor: '#f1f1f1',
          borderRadius: '8px',
          padding: '12px',
          minHeight: '100px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gridColumn: 'span 1 / span 1',
            position: 'relative',
            width: '100px',
          }}
        >
          <Image
            src={image}
            alt={title}
            fill
            style={{objectFit: 'cover'}}
            className="object-contain"
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            gridColumn: matches ? 'span 2 / span 2' : 'span 4 / span 4',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: '2',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '12px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: '3',
              }}
            >
              {description}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: '12px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {new URL(url).hostname}
          </Typography>
        </Box>
      </MuiLink>
    </Link>
  );
};

export {LinkCard};
