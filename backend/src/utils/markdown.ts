import { marked } from 'marked';
import { sanitizeHtml } from '../middleware/validationMiddleware';

export const processMarkdown = async (markdown: string): Promise<string> => {
  try {
    const html = await marked(markdown);
    return sanitizeHtml(html);
  } catch (error) {
    console.error('Markdown processing error:', error);
    return sanitizeHtml(markdown);
  }
};