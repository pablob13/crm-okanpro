let gapiLoaded = false;
let gsiLoaded = false;

/**
 * Carga dinámicamente los scripts necesarios de Google (OAuth2 y Picker API)
 */
export function loadGoogleScripts(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (gapiLoaded && gsiLoaded) return resolve();

    const hasGsi = document.getElementById('google-gsi-script');
    const hasGapi = document.getElementById('google-gapi-script');

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        gapiLoaded = true;
        gsiLoaded = true;
        resolve();
      }
    };

    if (hasGsi) {
      gsiLoaded = true;
    } else {
      const script1 = document.createElement('script');
      script1.id = 'google-gsi-script';
      script1.src = 'https://accounts.google.com/gsi/client';
      script1.async = true;
      script1.defer = true;
      script1.onload = () => {
        gsiLoaded = true;
        checkLoaded();
      };
      script1.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'));
      document.body.appendChild(script1);
    }

    if (hasGapi) {
      gapiLoaded = true;
    } else {
      const script2 = document.createElement('script');
      script2.id = 'google-gapi-script';
      script2.src = 'https://apis.google.com/js/api.js';
      script2.async = true;
      script2.onload = () => {
        gapiLoaded = true;
        checkLoaded();
      };
      script2.onerror = () => reject(new Error('No se pudo cargar Google API Client.'));
      document.body.appendChild(script2);
    }

    if (hasGsi && hasGapi) {
      resolve();
    } else {
      loadedCount = (hasGsi ? 1 : 0) + (hasGapi ? 1 : 0);
    }
  });
}

/**
 * Obtiene o solicita un token de acceso válido de Google OAuth2
 */
export function getGoogleAccessToken(clientId: string, additionalScopes = ''): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window no definido'));
    
    // Comprobar si hay un token válido y no expirado en localStorage
    const savedToken = localStorage.getItem('okanpro_gauth_token');
    const expiresAt = localStorage.getItem('okanpro_gauth_token_expires');
    
    if (savedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      return resolve(savedToken);
    }

    try {
      await loadGoogleScripts();
      
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.oauth2) {
        return reject(new Error('Google SDK no se ha inicializado correctamente en el navegador.'));
      }

      const scopes = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file' + (additionalScopes ? ' ' + additionalScopes : '');

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            const token = tokenResponse.access_token;
            localStorage.setItem('okanpro_gauth_token', token);
            localStorage.setItem(
              'okanpro_gauth_token_expires', 
              (Date.now() + (tokenResponse.expires_in - 300) * 1000).toString()
            );
            resolve(token);
          } else {
            reject(new Error('No se recibió el token de acceso de Google.'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err.message || 'Error en autenticación de Google.'));
        }
      });
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (e: any) {
      reject(e);
    }
  });
}

/**
 * Formatea bytes a una cadena legible (ej. 2.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Extrae el ID del archivo de Google Drive desde su URL
 */
export function extractGoogleFileId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Si es un enlace simulado, no extraer un ID real
  if (url.includes('mock') || url.includes('mock-') || url.includes('/mock/')) return null;

  const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (docMatch && docMatch[1]) return docMatch[1];
  
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  return null;
}

/**
 * Sube un documento escrito (HTML) a Google Drive y lo convierte a un Google Doc editable.
 * Si se proporciona un fileId, actualiza el archivo existente en Drive en lugar de crear uno nuevo.
 */
export async function uploadHtmlToGoogleDrive(
  clientId: string,
  title: string,
  htmlContent: string,
  fileId?: string | null
): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
  try {
    const token = await getGoogleAccessToken(clientId);
    
    // Preparar el HTML final con estructura de página limpia y colores/diseño okanpro
    const formattedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #334155; padding: 20px; }
          h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 5px; }
          h2 { color: #0f172a; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; }
          blockquote { border-left: 4px solid #0284c7; background: #f0f9ff; padding: 10px 20px; margin: 15px 0; }
          a { color: #0284c7; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const fileBlob = new Blob([formattedHtml], { type: 'text/html' });
    const fileName = `${title.replace(/[\/\\?%*:|"<>]/g, '_')}.html`; // Nombre de archivo limpio
    
    // Metadata: MimeType de Google Docs para forzar la conversión automática
    const metadata = {
      name: fileName.replace(/\.html$/i, ''), // El nombre en Drive no necesita la extensión
      mimeType: 'application/vnd.google-apps.document'
    };
    
    const boundary = 'okanpro_gdrive_upload_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    
    const metadataPart = new Blob([JSON.stringify(metadata) + '\r\n'], { type: 'application/json; charset=UTF-8' });
    const delimiterWithHeadersBlob = new Blob([
      `\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n`
    ], { type: 'text/plain' });
    
    const multipartBody = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      metadataPart,
      delimiterWithHeadersBlob,
      fileBlob,
      closeDelimiter
    ]);

    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,webViewLink`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
    const method = fileId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`API de Google Drive devolvió el estado ${response.status}: ${errTxt}`);
    }

    const data = await response.json();
    return { success: true, fileId: data.id, webViewLink: data.webViewLink };
  } catch (err: any) {
    console.error("Error al subir HTML a Google Drive:", err);
    return { success: false, error: err.message };
  }
}
