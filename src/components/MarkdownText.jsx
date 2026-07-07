import React from 'react';

export const parseMarkdown = (text, highlightNumbers = false) => {
  if (!text) return '';

  // 1. Escaping HTML characters
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. Highlight stats (e.g. 1250 ml, 6.5 hours, etc.)
  if (highlightNumbers) {
    html = html.replace(/(\b\d+(?:\.\d+)?(?:\s*(?:ml|glasses|hours|mins|minutes|%|hrs))?\b)/gi, '<strong style="color: var(--primary); font-weight: 700;">$1</strong>');
  }

  // 4. Line-by-line list parsing
  const lines = html.split('\n');
  let inBulletList = false;
  let inNumberedList = false;
  const processedLines = [];

  lines.forEach((line) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
    const numberedMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);

    if (bulletMatch) {
      if (inNumberedList) {
        processedLines.push('</ol>');
        inNumberedList = false;
      }
      if (!inBulletList) {
        processedLines.push('<ul>');
        inBulletList = true;
      }
      processedLines.push(`<li>${bulletMatch[1]}</li>`);
    } else if (numberedMatch) {
      if (inBulletList) {
        processedLines.push('</ul>');
        inBulletList = false;
      }
      if (!inNumberedList) {
        processedLines.push('<ol>');
        inNumberedList = true;
      }
      processedLines.push(`<li>${numberedMatch[2]}</li>`);
    } else {
      if (inBulletList) {
        processedLines.push('</ul>');
        inBulletList = false;
      }
      if (inNumberedList) {
        processedLines.push('</ol>');
        inNumberedList = false;
      }
      processedLines.push(line);
    }
  });

  if (inBulletList) processedLines.push('</ul>');
  if (inNumberedList) processedLines.push('</ol>');

  // Clean up carriage breaks next to block tags
  return processedLines.join('\n')
    .replace(/\n/g, '<br />')
    .replace(/<\/ul><br \/>/g, '</ul>')
    .replace(/<\/ol><br \/>/g, '</ol>')
    .replace(/<ul><br \/>/g, '<ul>')
    .replace(/<ol><br \/>/g, '<ol>');
};

const MarkdownText = ({ text, className, style, highlightNumbers = false }) => {
  return (
    <span 
      className={className} 
      style={style}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text, highlightNumbers) }} 
    />
  );
};

export default MarkdownText;
