import {GAEvent} from '@/types/googleAnalytics/event';

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? '';

const existsGaId = GA_ID !== '';

const pageView = (path: string): void => {
  window.gtag('config', GA_ID, {
    page_path: path,
  });
};

const gaEvent = ({action, category, label, value = ''}: GAEvent) => {
  if (!existsGaId) {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: JSON.stringify(label),
    value,
  });
};

export {GA_ID, existsGaId, pageView, gaEvent};
