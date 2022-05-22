import {Box, Tabs} from '@mui/material';
import {useMemo, VFC} from 'react';

import {LinkTab, LinkTabProps} from '@/components/atoms/LinkTab';

interface NavTabsProps {
  items: Array<LinkTabProps>;
  currentTab: string;
}

type Props = NavTabsProps;

const NavTabs: VFC<Props> = ({items, currentTab}) => {
  const index = useMemo(
    () =>
      currentTab === '/'
        ? 0
        : items.findIndex(({href}) => href === currentTab) !== -1
        ? items.findIndex(({href}) => href === currentTab) + 1
        : -1,
    [items, currentTab]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#094067',
        color: '#fffffe',
      }}
    >
      <Tabs
        value={index}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="nav tabs"
        sx={{
          ['& .MuiTabs-indicator']: {
            backgroundColor: '#fffffe',
          },
        }}
      >
        <LinkTab id="top" href="/" label="HOME" />
        {items.map((item) => (
          <LinkTab key={item.id} {...item} />
        ))}
      </Tabs>
    </Box>
  );
};

export type {NavTabsProps};
export {NavTabs};
