import {List, ListItem, Typography, Link as MuiLink} from '@mui/material';
import Link from 'next/link';
import * as React from 'react';

import {CategoryLink} from '@/libs/models/CategoryLink';

interface CategotyLinkListProps {
  categories: Array<CategoryLink>;
}

type Props = CategotyLinkListProps;

const CategoryLinkList: React.FC<Props> = ({categories}) => {
  return (
    <>
      <Typography variant="h3" sx={{color: '#fffffe'}}>
        カテゴリー
      </Typography>
      <List sx={{marginTop: '16px'}}>
        {categories.map(({title, count, path}) => (
          <ListItem
            key={path}
            sx={{
              paddingLeft: '0px',
            }}
          >
            <Link href={path} passHref>
              <MuiLink>{`${title} (${count})`}</MuiLink>
            </Link>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export type {CategotyLinkListProps};
export {CategoryLinkList};
