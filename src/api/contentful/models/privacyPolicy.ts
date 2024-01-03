import {PrivacyPolicyEntrySkeleton} from '@/api/contentful/models/blog';
import {ContentType} from '@/constants';
import {client} from '@/utils/contentful';

export const getPrivacyPolicy = async () => {
  const privacyPolicies = await client.getEntries<PrivacyPolicyEntrySkeleton>({
    content_type: ContentType.PrivacyPolicy,
    limit: 1,
  });
  return privacyPolicies.items.at(0);
};
