import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });
export function renderBlogMarkdown(markdown: string) {
  return marked.parse(markdown, { async: false }) as string;
}
