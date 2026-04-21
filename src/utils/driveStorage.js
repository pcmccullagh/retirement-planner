const FOLDER_NAME = 'Our Retirement Plan'
const FILE_NAME = 'retirement_data.json'
const DRIVE = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

async function driveGet(token, path, params = {}) {
  const url = new URL(`${DRIVE}${path}`)
  // Allow searching shared drives too
  url.searchParams.set('includeItemsFromAllDrives', 'true')
  url.searchParams.set('supportsAllDrives', 'true')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, { headers: authHeader(token) })
  if (!res.ok) throw new Error(`Drive GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function findOrCreateFolder(token) {
  const q = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const { files } = await driveGet(token, '/files', { q, fields: 'files(id,name)' })
  if (files?.length > 0) return files[0].id

  const res = await fetch(`${DRIVE}/files?supportsAllDrives=true`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  })
  if (!res.ok) throw new Error(`Failed to create Drive folder: ${res.status}`)
  const folder = await res.json()
  return folder.id
}

export async function findDataFile(token, folderId) {
  const q = `name='${FILE_NAME}' and '${folderId}' in parents and trashed=false`
  const { files } = await driveGet(token, '/files', { q, fields: 'files(id,name,modifiedTime)' })
  return files?.length > 0 ? files[0] : null
}

export async function loadFromDrive(token) {
  const folderId = await findOrCreateFolder(token)
  const file = await findDataFile(token, folderId)
  if (!file) return { data: null, folderId, fileId: null }

  const res = await fetch(
    `${DRIVE}/files/${file.id}?alt=media&supportsAllDrives=true`,
    { headers: authHeader(token) }
  )
  if (!res.ok) throw new Error(`Failed to read Drive file: ${res.status}`)
  const data = await res.json()
  return { data, folderId, fileId: file.id, modifiedTime: file.modifiedTime }
}

export async function saveToDrive(token, appState, folderId, fileId) {
  const content = JSON.stringify({ ...appState, lastUpdated: new Date().toISOString() }, null, 2)

  if (fileId) {
    const res = await fetch(
      `${UPLOAD}/files/${fileId}?uploadType=media&supportsAllDrives=true`,
      {
        method: 'PATCH',
        headers: { ...authHeader(token), 'Content-Type': 'application/json' },
        body: content,
      }
    )
    if (!res.ok) throw new Error(`Drive save failed: ${res.status}`)
    return fileId
  }

  // Create new file with multipart upload
  const boundary = 'rp_boundary_' + Math.random().toString(36).slice(2)
  const metadata = JSON.stringify({ name: FILE_NAME, parents: [folderId] })
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n')

  const res = await fetch(
    `${UPLOAD}/files?uploadType=multipart&fields=id&supportsAllDrives=true`,
    {
      method: 'POST',
      headers: {
        ...authHeader(token),
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  )
  if (!res.ok) throw new Error(`Drive create failed: ${res.status}`)
  const created = await res.json()
  return created.id
}

export async function fetchUserProfile(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: authHeader(token),
  })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return res.json()
}
