import Image from 'next/image';
import { cn } from '@/lib/utils';

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
  alt: string;
  src?: string | null;
};

export function SiteLogo({ className, priority = false, alt, src }: SiteLogoProps) {
  const logoSrc = src && src.trim() ? src : '/brand/rawnak-logo.png';
  return (
    <span className={cn('relative block overflow-hidden rounded-full', className)}>
      <Image
        src={logoSrc}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 64px, 96px"
        className="object-contain scale-[2.05]"
      />
    </span>
  );
}
