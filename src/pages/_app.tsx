import {CacheProvider, EmotionCache} from '@emotion/react';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {DefaultSeo} from 'next-seo';
import Head from 'next/head';
import * as React from 'react';

import {siteTitle, siteUrl} from '@/constants';
import {createEmotionCache} from '@/createEmotionCache';
import {theme} from '@/styles/theme/theme';

import type {AppProps} from 'next/app';

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const App: React.FC<MyAppProps> = ({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}) => {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    jssStyles?.parentElement?.removeChild(jssStyles);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DefaultSeo
        titleTemplate={`%s | ${siteTitle}`}
        defaultTitle={siteTitle}
        description="フロントエンドの技術的なことを書くブログです"
        additionalMetaTags={[
          {
            property: 'dc:creator',
            content: 'hr20k_',
          },
          {
            name: 'application-name',
            content: siteTitle,
          },
        ]}
        openGraph={{
          url: siteUrl,
          type: 'website',
          locale: 'ja_JP',
          site_name: siteTitle,
        }}
      />
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </>
  );
};

export default App;
