import { DriveFile } from '../types';
import { getAccessToken } from './firebaseAuth';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to access Google Drive.');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * List Markdown and text files from Google Drive
 */
export async function listDriveMarkdownFiles(searchTerm?: string): Promise<DriveFile[]> {
  const headers = await getAuthHeader();
  
  let query = "trashed = false and (mimeType = 'text/markdown' or mimeType = 'text/plain' or name contains '.md' or name contains '.markdown')";
  if (searchTerm && searchTerm.trim()) {
    const escaped = searchTerm.replace(/'/g, "\\'");
    query = `trashed = false and name contains '${escaped}'`;
  }

  const params = new URLSearchParams({
    q: query,
    pageSize: '40',
    orderBy: 'modifiedTime desc',
    fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink)',
  });

  const response = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to list Google Drive files (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return (data.files || []).map((file: any) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime,
    size: file.size,
    webViewLink: file.webViewLink,
    iconLink: file.iconLink,
  }));
}

/**
 * Get file metadata and content
 */
export async function getDriveFile(fileId: string): Promise<{ metadata: DriveFile; content: string }> {
  const headers = await getAuthHeader();

  // 1. Fetch metadata
  const metaRes = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime,size,webViewLink`,
    { headers }
  );

  if (!metaRes.ok) {
    throw new Error(`Failed to get file metadata (${metaRes.status})`);
  }
  const metadata: DriveFile = await metaRes.json();

  // 2. Fetch content
  const contentRes = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers,
  });

  if (!contentRes.ok) {
    throw new Error(`Failed to read file content (${contentRes.status})`);
  }
  const content = await contentRes.text();

  return { metadata, content };
}

/**
 * Create a new Markdown file on Google Drive
 */
export async function createDriveFile(name: string, content: string): Promise<DriveFile> {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to create files in Drive.');

  const fileName = name.trim().endsWith('.md') ? name.trim() : `${name.trim()}.md`;
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'text/markdown',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/markdown\r\n\r\n' +
    content +
    closeDelimiter;

  const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create file on Google Drive: ${errorText}`);
  }

  return response.json();
}

/**
 * Update an existing file on Google Drive
 */
export async function updateDriveFile(
  fileId: string,
  content: string,
  newName?: string
): Promise<DriveFile> {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to save changes.');

  // 1. Update file media content
  const mediaRes = await fetch(`${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/markdown',
    },
    body: content,
  });

  if (!mediaRes.ok) {
    const errorText = await mediaRes.text();
    throw new Error(`Failed to update file content: ${errorText}`);
  }

  // 2. If name changed, update metadata
  if (newName) {
    const cleanName = newName.trim().endsWith('.md') ? newName.trim() : `${newName.trim()}.md`;
    await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: cleanName }),
    });
  }

  // 3. Return updated metadata
  const metaRes = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,modifiedTime,size,webViewLink`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return metaRes.json();
}

/**
 * Check if the app was opened via Google Drive "Open with" parameter in URL
 */
export function extractDriveOpenWithFileId(): string | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    if (stateParam) {
      const stateObj = JSON.parse(stateParam);
      if (stateObj.ids && Array.isArray(stateObj.ids) && stateObj.ids.length > 0) {
        return stateObj.ids[0];
      }
    }
    const directFileId = urlParams.get('fileId');
    if (directFileId) return directFileId;
  } catch (e) {
    console.warn('Could not parse Drive URL state parameter', e);
  }
  return null;
}
