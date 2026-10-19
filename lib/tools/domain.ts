import type { Locale } from '@/i18n/config';
import type { ToolSlug } from '@/lib/tools/catalog';

export const TOOLS_HOST = 'tools.rawnakgroup.com';
export const TOOLS_ORIGIN = 'https://' + TOOLS_HOST;

/** Only the exact public tools hostname activates the tools-only navigation. */
export function isToolsHost(host: string | null | undefined): boolean {
  return (host ?? '').split(',')[0].trim().split(':')[0].toLowerCase() === TOOLS_HOST;
}

/** Local links adapt to production subdomain and to Vercel preview/base website. */
export function toolsPath(locale: Locale, tool?: ToolSlug, toolsHost = false): string {
  const path = '/' + locale + (toolsHost ? '' : '/tools');
  return path + (tool ? '/' + tool : toolsHost ? '/' : '');
}

export function toolsPublicUrl(locale: Locale, tool?: ToolSlug): string {
  return TOOLS_ORIGIN + toolsPath(locale, tool, true);
}
