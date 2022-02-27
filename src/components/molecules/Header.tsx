import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

const Header: React.FC = () => {
  const HeaderBar = styled.header({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    height: '200px',
  });

  const Logo = styled(Link)({
  });

  return (
    <HeaderBar>
      <Logo
        href='/'
      >
        <a>
          <Image
            src="/images/logo.png"
            width="650px"
            height="120px"
            alt='Tech Blog'
            objectFit='cover'
          />
        </a>
      </Logo>
    </HeaderBar>
  );
};

export {Header};
