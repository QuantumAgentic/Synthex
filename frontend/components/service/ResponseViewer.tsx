'use client';

import { TestResponse } from '@/types/service';
import { JSONResponseViewer } from './viewers/JSONResponseViewer';
import { ImageResponseViewer } from './viewers/ImageResponseViewer';
import { VideoResponseViewer } from './viewers/VideoResponseViewer';
import { AudioResponseViewer } from './viewers/AudioResponseViewer';
import { PDFResponseViewer } from './viewers/PDFResponseViewer';
import { TextResponseViewer } from './viewers/TextResponseViewer';
import { BinaryResponseViewer } from './viewers/BinaryResponseViewer';

interface ResponseViewerProps {
  response: TestResponse;
  outputSchema?: any;
}

export function ResponseViewer({ response, outputSchema }: ResponseViewerProps) {
  return (
    <div className="mt-3 sm:mt-6">
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Response</h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              response.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {response.status} {response.success ? 'Success' : 'Error'}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              {response.time}ms
            </span>
          </div>
        </div>

        {response.responseType === 'json' && (
          <JSONResponseViewer
            data={response.data}
            schema={outputSchema}
            schemaValid={response.schemaValid}
            errors={response.schemaErrors}
          />
        )}

        {response.responseType === 'image' && response.url && response.blob && (
          <ImageResponseViewer
            url={response.url}
            contentType={response.contentType}
            blob={response.blob}
          />
        )}

        {response.responseType === 'video' && response.url && (
          <VideoResponseViewer
            url={response.url}
            contentType={response.contentType}
          />
        )}

        {response.responseType === 'audio' && response.url && (
          <AudioResponseViewer url={response.url} />
        )}

        {response.responseType === 'pdf' && response.url && response.blob && (
          <PDFResponseViewer url={response.url} blob={response.blob} />
        )}

        {response.responseType === 'text' && response.text && (
          <TextResponseViewer text={response.text} />
        )}

        {response.responseType === 'binary' && response.blob && (
          <BinaryResponseViewer
            blob={response.blob}
            size={response.blob.size}
            contentType={response.contentType}
          />
        )}

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t text-xs sm:text-sm text-gray-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-medium">Transaction:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">{response.txHash}</code>
          </div>
        </div>

        {/* Payment info if available */}
        {(response as any).paymentInfo && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">Payment Details</p>
            <pre className="text-xs text-blue-800 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify((response as any).paymentInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
