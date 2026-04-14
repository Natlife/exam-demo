const tiptapToPlainText = (node: any): string => {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(tiptapToPlainText).join(' ');
  }
  return '';
};

const deltaToPlainText = (delta: any): string => {
  if (!delta) return '';

  if (delta.type === 'doc' || Array.isArray(delta.content)) {
    return tiptapToPlainText(delta);
  }

  if (delta.ops && Array.isArray(delta.ops)) {
    return delta.ops.map((op: any) => (typeof op.insert === 'string' ? op.insert : '')).join('');
  }

  if (Array.isArray(delta)) {
    return delta.map((op) => (typeof op.insert === 'string' ? op.insert : '')).join('');
  }

  return '';
};

const deltaToHtml = (deltaStringOrObj: string | { ops: any[] }): string => {
  try {
    const delta = typeof deltaStringOrObj === 'string' ? JSON.parse(deltaStringOrObj) : deltaStringOrObj;
    const ops: any[] = delta?.ops ?? (Array.isArray(delta) ? delta : []);

    let html = '';
    let listBuffer: { type: 'ordered' | 'bullet'; items: string[] } | null = null;

    const flushList = () => {
      if (!listBuffer) return;
      const tag = listBuffer.type === 'ordered' ? 'ol' : 'ul';
      html += `<${tag}>${listBuffer.items.map((li) => `<li>${li}</li>`).join('')}</${tag}>`;
      listBuffer = null;
    };

    const wrapInline = (text: string, attrs: any): string => {
      if (!attrs) return text;
      let out = text;
      if (attrs.bold) out = `<strong>${out}</strong>`;
      if (attrs.italic) out = `<em>${out}</em>`;
      if (attrs.underline) out = `<u>${out}</u>`;
      if (attrs.strike) out = `<s>${out}</s>`;
      const styles: string[] = [];
      if (attrs.color) styles.push(`color:${attrs.color}`);
      if (attrs.background) styles.push(`background-color:${attrs.background}`);
      if (styles.length) out = `<span style="${styles.join(';')}">${out}</span>`;
      return out;
    };

    for (const op of ops) {
      if (typeof op.insert !== 'string') continue;

      const attrs = op.attributes ?? {};
      const lines = op.insert.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const segment = lines[i];
        const isNewline = i < lines.length - 1; // there's a \n after this segment

        if (isNewline) {
          const listAttr: 'ordered' | 'bullet' | undefined = attrs.list;
          const lineContent = wrapInline(segment, attrs);

          if (listAttr === 'ordered' || listAttr === 'bullet') {
            if (!listBuffer || listBuffer.type !== listAttr) {
              flushList();
              listBuffer = { type: listAttr, items: [] };
            }
            listBuffer.items.push(lineContent);
          } else {
            flushList();
            html += segment === '' ? '<br>' : `<p>${lineContent}</p>`;
          }
        } else if (segment !== '') {
          html += wrapInline(segment, attrs);
        }
      }
    }

    flushList();
    return html;
  } catch {
    return '';
  }
};

export { deltaToPlainText, deltaToHtml };
