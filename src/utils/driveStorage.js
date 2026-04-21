const FILE_NAME   = 'retirement_data.json'
const FILE_ID_KEY = 'rp_drive_file_id'
const DRIVE  = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'
const PICKER_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

export function getStoredFileId() {
  return localStorage.getItem(FILE_ID_KEY) || null
}

export function storeFileId(fileId) {
  localStorage.setItem(FILE_ID_KEY, fileId)
}

export function clearStoredFileId() {
  localStorage.removeItem(FILE_ID_KEY)
}

// Create a new data file in Drive (used by whoever sets up first)
export async function createNewFile(token) {
  const boundary = 'rp_boundary_' + Math.random().toString(36).slice(2)
  const metadata = JSON.stringify({ name: FILE_NAME })
  const content  = JSON.stringify({})
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
    `${UPLOAD}/files?uploadType=multipart&fields=id`,
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
  const { id } = await res.json()
  storeFileId(id)
  return id
}

// Load data from a known file ID
export async function loadFromDrive(token, fileId) {
  const res = await fetch(`${DRIVE}/files/${fileId}?alt=media`, {
    headers: authHeader(token),
  })
  if (!res.ok) throw new Error(`Drive load failed: ${res.status}`)
  return await res.json()
}

// Save data to a known file ID
export async function saveToDrive(token, appState, fileId) {
  const content = JSON.stringify({ ...appState, lastUpdated: new Date().toISOString() }, null, 2)
  const res = await fetch(
    `${UPLOAD}/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: content,
    }
  )
  if (!res.ok) throw new Error(`Drive save failed: ${res.status}`)
}

export async function fetchUserProfile(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: authHeader(token),
  })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return res.json()
}

// Open Google Picker so the user can select an existing shared file
export function openFilePicker(token, onPicked) {
  const waitForGapi = (cb) => {
    if (window.gapi?.load) cb()
    else setTimeout(() => waitForGapi(cb), 150)
  }

  waitForGapi(() => {
    window.gapi.load('picker', () => {
      const builder = new window.google.picker.PickerBuilder()
        .addView(
          new window.google.picker.DocsView()
            .setMimeTypes('application/json')
            .setMode(window.google.picker.DocsViewMode.LIST)
        )
        .setOAuthToken(token)
        .setTitle('Select your Retirement Plan file')
      if (PICKER_API_KEY) builder.setDeveloperKey(PICKER_API_KEY)
      const picker = builder
        .setCallback((data) => {
          if (data.action === window.google.picker.Action.PICKED && data.docs?.[0]) {
            const fileId = data.docs[0].id
            storeFileId(fileId)
            onPicked(fileId)
          }
        })
        .build()
      picker.setVisible(true)
    })
  })
}
