'use client';

import { downloadBlob, formatBytes } from '@/lib/blob-utils';

interface ImageResponseViewerProps {
  url: string;
  contentType: string;
  blob: Blob;
}

export function ImageResponseViewer({ url, contentType, blob }: ImageResponseViewerProps) {
  const handleDownload = () => {
    downloadBlob(blob, `image-${Date.now()}.${contentType.split('/')[1]}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Image Response</span>
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
        >
          Download Image
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <img src={url} alt="Service response" className="max-w-full h-auto rounded shadow-lg" />
      </div>

      <div className="mt-2 text-sm text-gray-500">
        <span>{contentType}</span> • <span>{formatBytes(blob.size)}</span>
      </div>
    </div>
  );
}
