import { useState } from 'react';

function CodeBlock({ prompt = '$ ', code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Only copy the code, not the prompt
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Copy icon SVG (terminal-style)
  const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  // Checkmark icon SVG (terminal-style)
  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  return (
    <div className="code-block-wrapper">
      <div className="code-block">
        <button
          type="button"
          className="code-block-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
        <pre>
          <span className="code-block-prompt">{prompt}</span>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default CodeBlock;


