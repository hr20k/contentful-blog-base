import {Box, Tabs} from '@mui/material';
import {useMemo, VFC} from 'react';

import {LinkTab, LinkTabProps} from '@/components/atoms/LinkTab';
import {palette} from '@/styles/theme/theme';

interface NavTabsProps {
  items: Array<LinkTabProps>;
  currentPath: string;
}

type Props = NavTabsProps;

const NavTabs: VFC<Props> = ({items, currentPath}) => {
  const index = useMemo(
    () =>
      currentPath === '/'
        ? 0
        : items.findIndex(({href}) => new RegExp(`^${href}(\/.*)?$`).test(currentPath)) !== -1
        ? items.findIndex(({href}) => new RegExp(`^${href}(\/.*)?$`).test(currentPath)) + 1
        : undefined,
    [items, currentPath]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: palette.navTabsBackgroundColor,
        color: palette.navTabsColor,
      }}
    >
      <Tabs
        value={index}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="nav tabs"
        sx={{
          ['& .MuiTabs-indicator']: {
            backgroundColor: palette.navTabsColor,
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
