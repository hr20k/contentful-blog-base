import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import {useCallback, VFC} from 'react';

import {siteTitle, siteUrl} from '@/constants';
import {gaEvent} from '@/libs/gtag';
import {palette} from '@/styles/theme/theme';
import {GAAction, GACategory} from '@/types/googleAnalytics/event';

interface HeaderProps {
  logoUrl?: string;
}

type Props = HeaderProps;

const Header: VFC<Props> = ({logoUrl}) => {
  const HeaderBar = styled.header({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.headerBackgroundColor,
    height: '200px',
  });

  const Logo = styled(Link)({});

  const handleClick = useCallback(() => {
    gaEvent({
      action: GAAction.Click,
      category: GACategory.Link,
    });
  }, []);

  return (
    <HeaderBar>
      <Logo href={siteUrl} passHref>
        <Link href="/" passHref legacyBehavior>
          <Image
            src={logoUrl ?? '/images/logo.webp'}
            onClick={handleClick}
            width={650}
            height={120}
            alt={siteTitle}
            style={{
              objectFit: 'cover',
            }}
            priority={false}
          />
        </Link>
      </Logo>
    </HeaderBar>
  );
};

export type {HeaderProps};
export {Header};
