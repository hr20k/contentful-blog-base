import {Box, Typography, Button} from '@mui/material';
import Link from 'next/link';
import * as React from 'react';

import {SmallArticleCard} from '@/components/molecules/SmallArticleCard';
import type {CategoryLink} from '@/libs/models/CategoryLink';

interface CategoryCardProps {
  category: CategoryLink;
  items: Array<{
    href: string;
    imageSrc: string;
    title: string;
    date: string;
  }>;
}

type Props = CategoryCardProps;

const CategoryCard: React.FC<Props> = ({category, items}) => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <Typography variant="h2" textAlign="center" padding="16px 0">
        {category.title}
      </Typography>
      <Box>
        {items.slice(0, 5).map((item) => (
          <Box key={item.href} margin="8px 0">
            <SmallArticleCard {...item} />
          </Box>
        ))}
      </Box>
      <Box sx={{marginTop: '8px', marginBottom: '8px'}}>
        <Link href={category.path} passHref>
          <Button fullWidth variant="contained">
            もっと読む
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export type {CategoryCardProps};
export {CategoryCard};
