import {Tab} from '@mui/material';
import Link from 'next/link';
import {useCallback, VFC} from 'react';

import {gaEvent} from '@/libs/gtag';
import {GAAction, GACategory} from '@/types/googleAnalytics/event';

interface LinkTabProps {
  id: string;
  label: string;
  href: string;
}

type Props = LinkTabProps;

const LinkTab: VFC<Props> = ({id, label, href}) => {
  const handleClick = useCallback(() => {
    gaEvent({
      action: GAAction.Click,
      category: GACategory.Link,
    });
  }, []);

  return (
    <Tab
      component={Link}
      href={href}
      passHref
      id={id}
      label={label}
      value={href}
      onClick={handleClick}
      sx={{
        fontWeight: 'bold',
      }}
    />
  );
};

export type {LinkTabProps};
export {LinkTab};
