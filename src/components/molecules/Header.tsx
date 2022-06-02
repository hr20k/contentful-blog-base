import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import {FC, useCallback} from 'react';

import {siteTitle, siteUrl} from '@/constants';
import {gaEvent} from '@/libs/gtag';
import {GAAction, GACategory} from '@/types/googleAnalytics/event';

const Header: FC = () => {
  const HeaderBar = styled.header({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d8eefe',
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
        <a onClick={handleClick}>
          <Image
            // TODO: Contentful から取得する
            src="/images/logo.png"
            width="650px"
            height="120px"
            alt={siteTitle}
            objectFit="cover"
          />
        </a>
      </Logo>
    </HeaderBar>
  );
};

export {Header};
