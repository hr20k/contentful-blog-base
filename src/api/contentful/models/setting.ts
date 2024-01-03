import {SettingEntrySkeleton} from '@/api/contentful/models/blog';
import {ContentType} from '@/constants';
import {client} from '@/utils/contentful';

export const getSetting = async () => {
  const settings = await client.withoutUnresolvableLinks.getEntries<SettingEntrySkeleton>({
    content_type: ContentType.Setting,
  });
  const setting = settings.items.at(0);
  const settingsDefaultThumbnailUrl = setting?.fields.defaultThumbnail?.fields.file?.url;
  const lineId = setting?.fields.lineId;
  const defaultThumbnailUrl = settingsDefaultThumbnailUrl && `https:${settingsDefaultThumbnailUrl}`;
  const settingsLogoUrl = setting?.fields.logo?.fields.file?.url;
  const logoUrl = settingsLogoUrl && `https:${settingsLogoUrl}`;

  return {
    defaultThumbnailUrl,
    lineId,
    logoUrl,
  };
};
