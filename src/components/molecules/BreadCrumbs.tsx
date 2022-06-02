import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {Breadcrumbs as MuiBreadcrumbs, Typography} from '@mui/material';
import Link from 'next/link';
import {FC, useCallback} from 'react';

import {gaEvent} from '@/libs/gtag';
import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';
import {GAAction, GACategory} from '@/types/googleAnalytics/event';

interface BreadcrumbsProps {
  breadCrumbs: Array<BreadCrumbsModel>;
}

type Props = BreadcrumbsProps;

const BreadCrumbs: FC<Props> = ({breadCrumbs}) => {
  const handleClick = useCallback(() => {
    gaEvent({
      action: GAAction.Click,
      category: GACategory.Link,
    });
  }, []);

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
      {breadCrumbs.slice(0, -1).map(({href, displayName}) => (
        <Link key={href} href={href}>
          <a onClick={handleClick}>{displayName}</a>
        </Link>
      ))}
      {breadCrumbs.slice(-1).map(({href, displayName}) => (
        <Typography key={href}>{displayName}</Typography>
      ))}
    </MuiBreadcrumbs>
  );
};

export type {BreadcrumbsProps};
export {BreadCrumbs};
