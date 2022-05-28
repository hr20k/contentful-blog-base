import createEmotionServer from '@emotion/server/create-instance';
import {RenderPageResult} from 'next/dist/shared/lib/utils';
import Document, {DocumentContext, Html, Head, Main, NextScript} from 'next/document';
import * as React from 'react';

import {createEmotionCache} from '@/createEmotionCache';
import {theme} from '@/styles/theme/theme';

/**
 *
 *
 * @class MyDocument
 * @extends {Document}
 */
class MyDocument extends Document {
  /**
   *
   *
   * @static
   * @param {DocumentContext} ctx
   * @return {*}
   * @memberof MyDocument
   */
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;

    const cache = createEmotionCache();
    const {extractCriticalToChunks} = createEmotionServer(cache);

    ctx.renderPage = (): RenderPageResult | Promise<RenderPageResult> =>
      originalRenderPage({
        enhanceApp:
          (App: any) =>
          // eslint-disable-next-line react/display-name
          (props): JSX.Element =>
            <App emotionCache={cache} {...props} />,
      });

    const initialProps = await Document.getInitialProps(ctx);
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        key={style.key}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: style.css}}
      />
    ));

    return {
      ...initialProps,
      styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags],
    };
  }

  /**
   *
   *
   * @return {*}
   * @memberof MyDocument
   */
  render() {
    return (
      <Html lang="ja">
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:300,400,500,700&display=swap"
            rel="stylesheet"
          ></link>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
