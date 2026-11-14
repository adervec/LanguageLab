// Google Drive backup to the private app-data folder, the same shape as MicroMiniger / Tachyread /
// GymTracker's sync layer. The bytes never touch a server of ours: your browser talks to your Drive.
const t = k => globalThis.appFont?.t ? globalThis.appFont.t(k) : k;

// The OAuth client (and its app-data folder) is shared across the family of apps, so each app owns
// its own file name.
export const BACKUP_NAME = 'languagelab-backup.json';

// Public OAuth client id shared with the other apps: an identifier, not a secret. Google only
// honours it from the registered origins; a fork deployed elsewhere must supply its own.
const CLIENT_ID = '547617739897-br6dj2facmsc34qnkjb5u4dbfhju39pu.apps.googleusercontent.com';
export function driveAvailable() {
  const h = location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || location.origin === 'https://adervec.github.io';
}

let gisLoaded = null;
function loadGis() {
  return gisLoaded ||= new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { gisLoaded = null; reject(new Error(t('Could not load Google sign-in.'))); };
    document.head.appendChild(s);
  });
}
const DRIVE_SCOPE = 'openid email profile https://www.googleapis.com/auth/drive.appdata';

// The access token lives in memory only and is never stored.
let _token = null; // { value, exp }
const tokenValid = () => !!_token && _token.exp > Date.now() + 60000;

async function fetchProfile(token) {
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return;
    const j = await r.json();
    // house standard 1: the picture sits in the top bar while synced
    window.appFont?.setAccount({ name: j.name || j.email || 'Google', picture: j.picture || '', email: j.email || '' });
  } catch { /* cosmetic only */ }
}
function requestToken(prompt) {
  return new Promise((resolve, reject) => {
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID, scope: DRIVE_SCOPE,
      callback: resp => {
        if (!resp?.access_token) return reject(new Error(resp?.error || t('Sign-in failed.')));
        _token = { value: resp.access_token, exp: Date.now() + (resp.expires_in || 3600) * 1000 };
        resolve();
      },
      error_callback: err => reject(new Error(err?.message || err?.type || t('Sign-in was dismissed.'))),
    }).requestAccessToken({ prompt });
  });
}
const auth = () => ({ Authorization: `Bearer ${_token.value}` });
async function find() {
  const q = encodeURIComponent(`name='${BACKUP_NAME}' and trashed=false`);
  const r = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)`, { headers: auth() });
  if (!r.ok) throw new Error(`Drive list failed (${r.status}).`);
  return (await r.json()).files?.[0]?.id || null;
}

export const drive = {
  connected: tokenValid,
  // silent (start-up, background) only reuses an existing grant
  async connect({ silent = false } = {}) {
    if (!driveAvailable()) throw new Error(t('Google Drive sync is not enabled on this address.'));
    if (tokenValid()) return;
    await loadGis();
    try { await requestToken(''); } catch (e) { if (silent) throw e; await requestToken('consent'); }
    await fetchProfile(_token.value);
  },
  disconnect() { _token = null; window.appFont?.setAccount(null); },
  // -> the saved text, or null when there is no copy yet
  async download() {
    const id = await find();
    if (!id) return null;
    const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, { headers: auth() });
    if (!r.ok) throw new Error(`Drive download failed (${r.status}).`);
    return r.text();
  },
  // resumable upload: no 5 MB cap
  async upload(text) {
    const id = await find();
    const init = await fetch(`https://www.googleapis.com/upload/drive/v3/files${id ? '/' + id : ''}?uploadType=resumable`, {
      method: id ? 'PATCH' : 'POST',
      headers: { ...auth(), 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(id ? {} : { name: BACKUP_NAME, parents: ['appDataFolder'] }),
    });
    const session = init.ok && init.headers.get('Location');
    if (!session) throw new Error(`Drive upload failed (${init.status}).`);
    const put = await fetch(session, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: text });
    if (!put.ok) throw new Error(`Drive upload failed (${put.status}).`);
  },
};
