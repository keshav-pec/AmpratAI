import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

/** Render markdown to HTML. Content is authored by us, so no sanitiser needed. */
export function md(src: string): string {
  return marked.parse(src ?? '', { async: false }) as string;
}

/** Render a single line of markdown (no wrapping <p>) — for outcomes and short labels. */
export function mdInline(src: string): string {
  return marked.parseInline(src ?? '', { async: false }) as string;
}

/** Split a notes document into slides on "---" lines. */
export function slides(src: string): string[] {
  return src
    .split(/^\s*---\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
}
