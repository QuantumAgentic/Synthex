'use client';

import { copyToClipboard } from '@/lib/blob-utils';
import { formatValidationErrors } from '@/lib/schema-utils';
import { ErrorObject } from 'ajv';

interface JSONResponseViewerProps {
  data: any;
  schema?: any;
  schemaValid?: boolean;
  errors?: ErrorObject[];
}

export function JSONResponseViewer({ data, schema, schemaValid, errors }: JSONResponseViewerProps) {
  const handleCopy = async () => {
    const success = await copyToClipboard(JSON.stringify(data, null, 2));
    if (success) alert('Copied to clipboard!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">JSON Response</span>
          {schema && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              schemaValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {schemaValid ? '✓ Schema Valid' : '✗ Schema Mismatch'}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Copy JSON
        </button>
      </div>

      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>

      {!schemaValid && errors && errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">Schema Validation Errors:</h4>
          <ul className="space-y-1">
            {formatValidationErrors(errors).map((err, i) => (
              <li key={i} className="text-sm text-red-800">• {err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
