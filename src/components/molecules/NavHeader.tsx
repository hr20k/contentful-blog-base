import {VFC} from 'react';

import {Header} from '@/components/molecules/Header';
import {NavTabs, NavTabsProps} from '@/components/molecules/NavTabs';

type NavHeaderProps = NavTabsProps;

type Props = NavHeaderProps;

const NavHeader: VFC<Props> = ({items, currentTab}) => {
  return (
    <>
      <Header />
      <NavTabs items={items} currentTab={currentTab} />
    </>
  );
};

export type {NavHeaderProps};
export {NavHeader};
