import {VFC} from 'react';

import {Header, HeaderProps} from '@/components/molecules/Header';
import {NavTabs, NavTabsProps} from '@/components/molecules/NavTabs';

type NavHeaderProps = NavTabsProps & HeaderProps;

type Props = NavHeaderProps;

const NavHeader: VFC<Props> = ({items, currentPath, logoUrl}) => {
  return (
    <>
      <Header logoUrl={logoUrl} />
      <NavTabs items={items} currentPath={currentPath} />
    </>
  );
};

export type {NavHeaderProps};
export {NavHeader};
