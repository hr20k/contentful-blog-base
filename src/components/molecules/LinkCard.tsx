import {Box, Link as MuiLink, Typography} from '@mui/material';
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
  return (
    <Link href={url} passHref legacyBehavior>
      <MuiLink
        target="_brank"
        underline="none"
        sx={{
          cursor: 'pointer',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr));',
          backgroundColor: 'white',
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
            justifyContent: 'flex-start',
            flexDirection: 'column',
            gridColumn: 'span 4 / span 4',
          }}
        >
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
      </MuiLink>
    </Link>
  );
};

export {LinkCard};
