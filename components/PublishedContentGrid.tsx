'use client';

import { trackAnalyticsEvent } from '@/lib/analytics/client';
import { type ContentCollection, type ContentItem } from '@/lib/content/repository';

type Props = {
  locale: string;
  collection: ContentCollection;
  items: ContentItem[];
};

export function PublishedContentGrid({ locale, collection, items }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const title = locale === 'ar' ? item.title_ar : item.title_en;
        const description = locale === 'ar' ? item.description_ar : item.description_en;

        return (
          <article
            key={item.id}
            className="glass-card cursor-pointer rounded-2xl border border-border/70 p-5"
            onClick={() =>
              trackAnalyticsEvent({
                eventName: 'content_click',
                locale: locale === 'ar' ? 'ar' : 'en',
                pageSlug: collection === 'kits' ? 'diy' : collection,
                entityType: collection,
                entityId: item.id,
                entitySlug: item.slug,
                entityLabel: title,
                metadata: { source: 'published_content_grid' },
              })
            }
          >
            <h2 className="text-start text-base font-medium text-foreground">{title}</h2>
            {description ? (
              <p className="mt-2 text-start text-sm text-muted-foreground">{description}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
