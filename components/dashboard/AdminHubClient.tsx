'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type HubLink = {
  href: string;
  label: string;
};

type HubCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  links: HubLink[];
};

const FAVORITES_KEY = 'rawnak_admin_hub_favorites';

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function AdminHubClient({
  cards,
  labels,
}: {
  cards: HubCard[];
  labels: {
    searchPlaceholder: string;
    favorites: string;
    noFavorites: string;
    pin: string;
    unpin: string;
  };
}) {
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavorites(parsed.filter((item): item is string => typeof item === 'string'));
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  const allLinks = useMemo(() => {
    const map = new Map<string, string>();
    for (const card of cards) {
      map.set(card.href, card.title);
      for (const link of card.links) {
        map.set(link.href, link.label);
      }
    }
    return map;
  }, [cards]);

  const favoriteLinks = useMemo(
    () =>
      favorites
        .filter((href) => allLinks.has(href))
        .map((href) => ({ href, label: allLinks.get(href) || href })),
    [allLinks, favorites],
  );

  const filteredCards = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return cards;

    return cards
      .map((card) => {
        const cardMatches =
          normalizeQuery(card.title).includes(q) || normalizeQuery(card.description).includes(q);
        const matchedLinks = card.links.filter((link) => normalizeQuery(link.label).includes(q));
        if (!cardMatches && matchedLinks.length === 0) return null;
        return {
          ...card,
          links: cardMatches ? card.links : matchedLinks,
        };
      })
      .filter(Boolean) as HubCard[];
  }, [cards, query]);

  function persist(next: string[]) {
    setFavorites(next);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }

  function toggleFavorite(href: string) {
    if (favorites.includes(href)) {
      persist(favorites.filter((item) => item !== href));
    } else {
      persist([...favorites, href]);
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.searchPlaceholder}
          className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
        />
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{labels.favorites}</h2>
        {favoriteLinks.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{labels.noFavorites}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {favoriteLinks.map((link) => (
              <div key={link.href} className="flex items-center gap-2 rounded-md border border-border/70 bg-card/70 px-3 py-2">
                <Link href={link.href} className="text-xs text-foreground">
                  {link.label}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleFavorite(link.href)}
                  className="text-[10px] text-muted-foreground"
                >
                  {labels.unpin}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCards.map((card) => (
          <article key={card.id} className="glass-card rounded-2xl border border-border/70 p-5">
            <div className="flex items-start justify-between gap-2">
              <Link href={card.href} className="text-start text-base font-semibold text-foreground hover:underline">
                {card.title}
              </Link>
              <button
                type="button"
                onClick={() => toggleFavorite(card.href)}
                className="rounded-md border border-border/70 px-2 py-1 text-[10px] text-muted-foreground"
              >
                {favorites.includes(card.href) ? labels.unpin : labels.pin}
              </button>
            </div>
            <p className="mt-2 text-start text-sm text-muted-foreground">{card.description}</p>
            <div className="mt-4 grid gap-2">
              {card.links.map((link) => (
                <div key={link.href} className="flex items-center justify-between rounded-md border border-border/70 bg-card/50 px-3 py-2">
                  <Link href={link.href} className="text-xs text-foreground hover:underline">
                    {link.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(link.href)}
                    className="text-[10px] text-muted-foreground"
                  >
                    {favorites.includes(link.href) ? labels.unpin : labels.pin}
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

