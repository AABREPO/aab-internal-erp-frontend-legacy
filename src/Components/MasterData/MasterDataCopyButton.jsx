import React, { useCallback, useState } from 'react';

/**
 * Same copy control as `CopyButton` in src/Components/MasterData/MasterData.js (Account Details popups).
 */
const MasterDataCopyButton = ({ text, fieldName, buttonId, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    const value = String(text ?? '');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error('clipboard unavailable');
      }
    } catch (err) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (e) {
        console.error('Failed to copy: ', e);
        return;
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded text-xs font-medium transition-colors duration-200 ${
        copied ? 'bg-green-100 text-green-700' : 'text-gray-600'
      } ${className}`}
      title="Copy"
      data-field={fieldName || undefined}
      data-copy-id={buttonId || undefined}
    >
      {copied ? (
        'Copied!'
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
};

export default MasterDataCopyButton;
