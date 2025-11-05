'use client';

import { downloadBlob, formatBytes, blobToHex } from '@/lib/blob-utils';
import { useState, useEffect } from 'react';

interface BinaryResponseViewerProps {
  blob: Blob;
  size: number;
  contentType: string;
}

export function BinaryResponseViewer({ blob, size, contentType }: BinaryResponseViewerProps) {
  const [hexPreview, setHexPreview] = useState<string>('');

  useEffect(() => {
    const loadHex = async () => {
      const preview = await blobToHex(blob.slice(0, 256));
      setHexPreview(preview);
    };
    loadHex();
  }, [blob]);

  const handleDownload = () => {
    downloadBlob(blob, `file-${Date.now()}.bin`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Binary File</span>
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
        >
          Download File
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Content Type</p>
            <p className="font-mono text-sm">{contentType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">File Size</p>
            <p className="font-mono text-sm">{formatBytes(size)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Hex Preview (first 256 bytes)</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
            {hexPreview || 'Loading...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
