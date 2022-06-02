import {List, ListItem, Typography, Link as MuiLink} from '@mui/material';
import Link from 'next/link';
import {FC, useCallback} from 'react';

import {gaEvent} from '@/libs/gtag';
import {CategoryLink} from '@/libs/models/CategoryLink';
import {GAAction, GACategory} from '@/types/googleAnalytics/event';

interface CategoryLinkListProps {
  categories: Array<CategoryLink>;
}

type Props = CategoryLinkListProps;

const CategoryLinkList: FC<Props> = ({categories}) => {
  const handleClick = useCallback(() => {
    gaEvent({
      action: GAAction.Click,
      category: GACategory.Link,
    });
  }, []);

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
              <MuiLink onClick={handleClick}>{`${title} (${count})`}</MuiLink>
            </Link>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export type {CategoryLinkListProps};
export {CategoryLinkList};
