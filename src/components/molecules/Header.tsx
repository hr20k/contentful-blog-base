import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import {siteTitle, siteUrl} from '@/constants';

const Header: React.FC = () => {
  const HeaderBar = styled.header({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d8eefe',
    height: '200px',
  });

  const Logo = styled(Link)({});

  return (
    <HeaderBar>
      <Logo href={siteUrl}>
        <a>
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
