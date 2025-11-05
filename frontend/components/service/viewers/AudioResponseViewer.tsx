'use client';

interface AudioResponseViewerProps {
  url: string;
}

export function AudioResponseViewer({ url }: AudioResponseViewerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Audio Response</span>
        <a
          href={url}
          download
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
        >
          Download Audio
        </a>
      </div>

      <audio controls className="w-full">
        <source src={url} />
        Your browser doesn't support audio playback.
      </audio>
    </div>
  );
}
