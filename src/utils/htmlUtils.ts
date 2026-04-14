export const isHtmlEmpty = (value: string | undefined): boolean => {
  if (!value) return true;

  // Check if it's a Tiptap JSON string
  try {
    const parsed = JSON.parse(value);
    if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
      const hasText = (nodes: any[]): boolean => {
        return nodes.some(node => {
          if (node.text && node.text.trim().length > 0) return true;
          if (node.content) return hasText(node.content);
          return false;
        });
      };
      return !hasText(parsed.content);
    }
  } catch (e) {
    // Not JSON, treat as HTML
  }

  const stripped = value.replace(/<[^>]*>/g, '').trim();
  return stripped === '';
};
