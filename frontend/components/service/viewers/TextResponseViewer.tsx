'use client';

import { copyToClipboard } from '@/lib/blob-utils';

interface TextResponseViewerProps {
  text: string;
}

export function TextResponseViewer({ text }: TextResponseViewerProps) {
  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) alert('Copied to clipboard!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Text Response</span>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Copy Text
        </button>
      </div>

      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}
