/**
 * Challenges Panel Component
 * Display business risks and challenges for Owner Dashboard
 */

import Link from 'next/link';
import type { ChallengeItem } from '@/lib/owner-console/types';
import { PanelWrapper, PanelEmpty } from './PanelStates';

type ChallengesPanelProps = {
  challenges: ChallengeItem[];
  locale: string;
  labels: {
    title: string;
    noChallenges: string;
    needsConfiguration: string;
    viewAll: string;
  };
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function ChallengesPanel({
  challenges,
  locale,
  labels,
}: ChallengesPanelProps) {
  if (challenges.length === 0) {
    return (
      <PanelWrapper title={labels.title} status="empty">
        <PanelEmpty message={labels.noChallenges} />
      </PanelWrapper>
    );
  }

  const displayedChallenges = challenges.slice(0, 6);

  return (
    <PanelWrapper title={labels.title} status="ok">
      <div className="space-y-3">
        {displayedChallenges.map((challenge) => (
          <div key={challenge.id} className="rounded-lg border border-border/50 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{challenge.title}</h4>
                {challenge.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{challenge.description}</p>
                )}
              </div>
              <span
                className={`ml-2 inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${severityColors[challenge.severity]}`}
              >
                {challenge.severity}
              </span>
            </div>
            {challenge.evidence && Object.keys(challenge.evidence).length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {Object.entries(challenge.evidence)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <p key={key}>
                      {key}: {String(value)}
                    </p>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {challenges.length > 6 && (
        <Link
          href={`/${locale}/admin/owner/challenges`}
          className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {labels.viewAll}
          <span className="ml-1">→</span>
        </Link>
      )}
    </PanelWrapper>
  );
}
