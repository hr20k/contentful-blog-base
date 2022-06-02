const GAAction = {
  Click: 'click',
} as const;

type GAAction = typeof GAAction[keyof typeof GAAction];

const GACategory = {
  Link: 'link',
} as const;

type GACategory = typeof GACategory[keyof typeof GACategory];

type ClickEvent = {
  action: GAAction;
  category: GACategory;
};

type GAEvent = ClickEvent & {
  label?: Record<string, string | number | boolean>;
  value?: string;
};

export type {GAEvent};
export {GAAction, GACategory};
