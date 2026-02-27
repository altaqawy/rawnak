import { cn } from '@/lib/utils';

type EmptyStateGridProps = {
  message: string;
  items?: number;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClass: Record<NonNullable<EmptyStateGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
};

export function EmptyStateGrid({
  message,
  items = 3,
  columns = 3,
  className,
}: EmptyStateGridProps) {
  return (
    <div className={cn('grid gap-5', columnClass[columns], className)}>
      {Array.from({ length: items }).map((_, index) => (
        <article
          key={index}
          className="glass-card rounded-2xl border border-border/70 p-6"
        >
          <p className="text-sm text-muted-foreground">{message}</p>
        </article>
      ))}
    </div>
  );
}
