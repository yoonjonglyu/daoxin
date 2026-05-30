// Dynamically load Google Identity Services script
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google GIS script'));
    document.head.appendChild(script);
  });
};

// Initialize Token Client and request OAuth access token
export const requestAccessToken = (clientId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!(window as any).google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services SDK is not loaded'));
        return;
      }
      
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token returned'));
          }
        },
      });
      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
};

// Search for daoxin_backup.json on Google Drive
export const searchBackupFile = async (token: string): Promise<{ id: string; name: string; modifiedTime?: string } | null> => {
  const q = encodeURIComponent("name='daoxin_backup.json' and trashed=false");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Search failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

// Download backup file contents
export const downloadBackupFile = async (token: string, fileId: string): Promise<any> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Download failed: ${res.statusText}`);
  }
  return await res.json();
};

// Upload backup file (Creates new or updates existing)
export const uploadBackupFile = async (token: string, data: any, fileId?: string): Promise<string> => {
  const metadata = {
    name: 'daoxin_backup.json',
    mimeType: 'application/json',
  };
  
  const boundary = 'daoxin_multipart_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  
  const body = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(data) +
    closeDelimiter;

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';
  
  if (fileId) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    method = 'PATCH';
  }
  
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Upload failed: ${res.statusText}`);
  }
  
  const result = await res.json();
  return result.id;
};
