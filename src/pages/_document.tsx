import React from 'react';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import type { DocumentContext, DocumentInitialProps } from 'next/document';

class MyDocument extends Document<{ nonce?: string }> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { nonce?: string }> {
    const cache = createCache();
    const originalRenderPage = ctx.renderPage;

    // Ambil nonce per-request dari header yang diset oleh middleware
    const headerNonce = (ctx.req?.headers['x-csp-nonce'] as string | undefined) || undefined;
    const fallbackEnv = process.env.NEXT_PUBLIC_CSP_NONCE || process.env.CSP_NONCE || 'DEVSCAN123';
    const nonce = headerNonce || fallbackEnv;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => (
          <StyleProvider cache={cache} nonce={nonce}>
            <App {...props} />
          </StyleProvider>
        ),
      });

    const initialProps = await Document.getInitialProps(ctx);
    const style = extractStyle(cache, true);
    return {
      ...initialProps,
      nonce,
      styles: (
        <>
          {initialProps.styles}
          <style nonce={nonce} dangerouslySetInnerHTML={{ __html: style }} />
        </>
      ),
    };
  }

  render() {
    const nonce = (this.props as any).nonce;
    return (
      <Html lang="en">
        <Head>
          {/* Self-host fonts via next/font; remove external Google Fonts links */}
          {/* Using next/font in _app.tsx to apply Roboto without external requests */}
          {/* Set webpack nonce lebih awal agar style-loader menggunakan nonce yang sama */}
          <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `window.__webpack_nonce__=${JSON.stringify(nonce)};` }} />
        </Head>
        <body>
          <Main />
          {/* Beri nonce ke semua inline script Next untuk lolos CSP ketat */}
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;


