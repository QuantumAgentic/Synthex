'use client';

interface VideoResponseViewerProps {
  url: string;
  contentType: string;
}

export function VideoResponseViewer({ url, contentType }: VideoResponseViewerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Video Response</span>
        <a
          href={url}
          download
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
        >
          Download Video
        </a>
      </div>

      <video controls className="w-full rounded-lg shadow-lg">
        <source src={url} type={contentType} />
        Your browser doesn't support video playback.
      </video>
    </div>
  );
}
