import {Link as MuiLink} from '@mui/material';
import Link from 'next/link';
import {FC} from 'react';

const PrivacyPolicyLink: FC = () => {
  return (
    <Link href="/privacy-policy" passHref>
      <MuiLink>プライバシーポリシー</MuiLink>
    </Link>
  );
};
export {PrivacyPolicyLink};
