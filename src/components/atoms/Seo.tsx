import {NextSeo, NextSeoProps} from 'next-seo';
import * as React from 'react';

interface SeoProps extends NextSeoProps {}

type Props = SeoProps;

/**
 * SEO Component
 *
 * @param {*} {
 *   noindex: boolean デフォルトはtrue,
 *   nofollow: boolean デフォルトはtrue,
 *   ...props,
 * }
 * @return {*}
 */
const Seo: React.FC<Props> = ({
  noindex = typeof process.env.NEXT_PUBLIC_NO_INDEX === 'undefined'
    ? true
    : process.env.NEXT_PUBLIC_NO_INDEX === 'true',
  nofollow = typeof process.env.NEXT_PUBLIC_NO_FOLLOW === 'undefined'
    ? true
    : process.env.NEXT_PUBLIC_NO_FOLLOW === 'true',
  ...props
}) => {
  return <NextSeo noindex={noindex} nofollow={nofollow} {...props} />;
};

export type {SeoProps};
export {Seo};
