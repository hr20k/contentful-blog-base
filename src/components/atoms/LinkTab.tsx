import {Tab} from '@mui/material';
import Link from 'next/link';
import {VFC} from 'react';

interface LinkTabProps {
  id: string;
  label: string;
  href: string;
}

type Props = LinkTabProps;

const LinkTab: VFC<Props> = ({id, label, href}) => {
  return (
    <Link href={href} passHref>
      <Tab
        component="a"
        id={id}
        label={label}
        value={href}
        sx={{
          fontWeight: 'bold',
        }}
      />
    </Link>
  );
};

export type {LinkTabProps};
export {LinkTab};
