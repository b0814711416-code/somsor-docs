/**
 * Google Drive helper — ใช้ OAuth2 refresh token
 * (credentials เดียวกับระบบนโยบาย สพฐ.)
 *
 * ENV ที่ต้องตั้ง (ใน Vercel):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 *   GOOGLE_DRIVE_ROOT_FOLDER_ID  — ID ของ folder หลักใน Drive
 */

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getDriveToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     import.meta.env.GOOGLE_CLIENT_ID,
      client_secret: import.meta.env.GOOGLE_CLIENT_SECRET,
      refresh_token: import.meta.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);

  cachedToken = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

/** หา folder ตามชื่อภายใต้ parent — ถ้าไม่เจอสร้างใหม่ */
export async function findOrCreateFolder(
  name: string,
  parentId: string,
  token: string,
): Promise<string> {
  const q = `mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`;
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const listData = await listRes.json();

  if (listData.files?.length) return listData.files[0].id as string;

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  const created = await createRes.json();
  if (!created.id) throw new Error(`สร้าง folder ล้มเหลว: ${JSON.stringify(created)}`);
  return created.id as string;
}

/** อัปโหลดไฟล์ไปยัง folder และ return { fileId, webViewLink } */
export async function uploadFileToDrive(
  file: File,
  folderId: string,
  token: string,
): Promise<{ fileId: string; webViewLink: string }> {
  const metadata = JSON.stringify({ name: file.name, parents: [folderId] });

  const form = new FormData();
  form.append('metadata', new Blob([metadata], { type: 'application/json' }));
  form.append('file', file);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  );
  const uploaded = await uploadRes.json();
  if (!uploaded.id) throw new Error(`อัปโหลดล้มเหลว: ${JSON.stringify(uploaded)}`);

  // ตั้ง permission ให้ทุกคนดูได้
  await fetch(`https://www.googleapis.com/drive/v3/files/${uploaded.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });

  const webViewLink =
    uploaded.webViewLink ||
    `https://drive.google.com/file/d/${uploaded.id}/view?usp=sharing`;

  return { fileId: uploaded.id, webViewLink };
}

/**
 * สร้าง/หา folder ตาม level + indicator แล้วอัปโหลดไฟล์
 * โครงสร้าง: Root → ขั้นพื้นฐาน|ปฐมวัย → {code} {name}
 */
export async function uploadDocumentFile(
  file: File,
  level: 'basic' | 'early',
  indicatorCode: string,
  indicatorName: string,
): Promise<{ fileId: string; webViewLink: string }> {
  const rootId = import.meta.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootId) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not set');

  const token = await getDriveToken();

  const levelName = level === 'early' ? 'ปฐมวัย' : 'ขั้นพื้นฐาน';
  const levelFolderId = await findOrCreateFolder(levelName, rootId, token);

  const indicatorFolderName = `${indicatorCode} ${indicatorName}`;
  const indicatorFolderId = await findOrCreateFolder(indicatorFolderName, levelFolderId, token);

  return uploadFileToDrive(file, indicatorFolderId, token);
}
