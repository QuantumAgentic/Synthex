'use client';

import { downloadBlob } from '@/lib/blob-utils';

interface PDFResponseViewerProps {
  url: string;
  blob: Blob;
}

export function PDFResponseViewer({ url, blob }: PDFResponseViewerProps) {
  const handleDownload = () => {
    downloadBlob(blob, `document-${Date.now()}.pdf`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">PDF Document</span>
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
        >
          Download PDF
        </button>
      </div>

      <iframe
        src={url}
        className="w-full h-[600px] rounded-lg border"
        title="PDF Response"
      />
    </div>
  );
}
