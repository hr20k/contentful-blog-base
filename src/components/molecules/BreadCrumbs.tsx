import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {Breadcrumbs as MuiBreadcrumbs, Typography} from '@mui/material';
import Link from 'next/link';
import * as React from 'react';

import {BreadCrumbsModel} from '@/libs/models/BreadCrumbsModel';

interface BreadcrumbsProps {
  breadCrumbs: Array<BreadCrumbsModel>;
}

type Props = BreadcrumbsProps;

const BreadCrumbs: React.FC<Props> = ({breadCrumbs}) => {
  return (
    <MuiBreadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
      {breadCrumbs.slice(0, -1).map(({href, displayName}) => (
        <Link key={href} href={href}>
          <a>{displayName}</a>
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
