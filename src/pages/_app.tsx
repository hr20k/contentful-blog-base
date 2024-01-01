import {CacheProvider, EmotionCache} from '@emotion/react';
import {CssBaseline, ThemeProvider} from '@mui/material';
import Head from 'next/head';
import {DefaultSeo} from 'next-seo';
import {useEffect} from 'react';

import {siteDescription, siteTitle, siteUrl} from '@/constants';
import {createEmotionCache} from '@/createEmotionCache';
import {usePageView} from '@/hooks/usePageView';
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
  usePageView();

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    jssStyles?.parentElement?.removeChild(jssStyles);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <DefaultSeo
        titleTemplate={`%s | ${siteTitle}`}
        defaultTitle={siteTitle}
        description={siteDescription}
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
