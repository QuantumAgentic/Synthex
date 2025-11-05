import { ResponseType, ParsedResponse } from '@/types/service';

/**
 * Detect response type from Content-Type header
 */
export function detectResponseType(contentType: string): ResponseType {
  const type = contentType.toLowerCase();

  if (type.includes('application/json')) return 'json';
  if (type.includes('image/')) return 'image';
  if (type.includes('video/')) return 'video';
  if (type.includes('audio/')) return 'audio';
  if (type.includes('application/pdf')) return 'pdf';
  if (type.includes('text/')) return 'text';

  return 'binary';
}

/**
 * Parse HTTP response based on content type
 */
export async function parseResponse(response: Response): Promise<ParsedResponse> {
  const contentType = response.headers.get('content-type') || '';
  const responseType = detectResponseType(contentType);

  try {
    switch (responseType) {
      case 'json': {
        const data = await response.json();
        return {
          type: 'json',
          data,
          contentType
        };
      }

      case 'image':
      case 'video':
      case 'audio':
      case 'pdf': {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        return {
          type: responseType,
          blob,
          url,
          contentType,
          size: blob.size
        };
      }

      case 'text': {
        const text = await response.text();
        return {
          type: 'text',
          text,
          contentType
        };
      }

      default: {
        const blob = await response.blob();
        return {
          type: 'binary',
          blob,
          contentType,
          size: blob.size
        };
      }
    }
  } catch (error) {
    console.error('Error parsing response:', error);

    // Fallback to binary
    const blob = await response.blob();
    return {
      type: 'binary',
      blob,
      contentType,
      size: blob.size
    };
  }
}

/**
 * Get human-readable name for response type
 */
export function getResponseTypeName(type: ResponseType): string {
  const names: Record<ResponseType, string> = {
    json: 'JSON Response',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    pdf: 'PDF Document',
    text: 'Text',
    binary: 'Binary File'
  };

  return names[type] || 'Unknown';
}

/**
 * Get icon for response type
 */
export function getResponseTypeIcon(type: ResponseType): string {
  const icons: Record<ResponseType, string> = {
    json: '{ }',
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    pdf: '📄',
    text: '📝',
    binary: '📦'
  };

  return icons[type] || '📄';
}
