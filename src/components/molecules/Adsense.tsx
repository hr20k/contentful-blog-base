import {useRouter} from 'next/router';
import {useEffect} from 'react';

const Adsense = (): JSX.Element => {
  const {asPath} = useRouter();

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log(err);
    }
  }, [asPath]);

  return (
    <div key={asPath}>
      <ins
        className="adsbygoogle"
        style={{display: 'block', textAlign: 'center'}}
        data-adtest={process.env.NODE_ENV === 'production' ? 'off' : 'on'}
        data-ad-layout="in-article"
        data-ad-format="auto"
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ?? ''}
        data-ad-slot="xxx"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export {Adsense};
