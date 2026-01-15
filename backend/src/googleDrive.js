import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

// Google Drive configuration
// NOTE: In production, you would need to set up OAuth2 credentials
// For this demo, we'll provide instructions in the README

let drive = null

export async function initializeDrive() {
  try {
    // Check if credentials file exists
    const credentialsPath = path.join(process.cwd(), 'credentials.json')

    if (!fs.existsSync(credentialsPath)) {
      console.log('Google Drive credentials not found. Image upload will be stored locally.')
      return null
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    drive = google.drive({ version: 'v3', auth })
    console.log('Google Drive initialized successfully')
    return drive
  } catch (error) {
    console.error('Error initializing Google Drive:', error.message)
    return null
  }
}

export async function uploadImageToDrive(filePath, fileName) {
  if (!drive) {
    // If Drive is not initialized, return a local path
    return `/uploads/${fileName}`
  }

  try {
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
    }

    const media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath),
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    })

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    // Get the direct link
    const file = await drive.files.get({
      fileId: response.data.id,
      fields: 'webContentLink',
    })

    return file.data.webContentLink
  } catch (error) {
    console.error('Error uploading to Google Drive:', error.message)
    // Fallback to local storage
    return `/uploads/${fileName}`
  }
}

export async function deleteImageFromDrive(fileUrl) {
  if (!drive || !fileUrl.includes('drive.google.com')) {
    return true
  }

  try {
    // Extract file ID from URL
    const fileIdMatch = fileUrl.match(/[-\w]{25,}/)
    if (!fileIdMatch) return false

    await drive.files.delete({
      fileId: fileIdMatch[0],
    })

    return true
  } catch (error) {
    console.error('Error deleting from Google Drive:', error.message)
    return false
  }
}

export default { initializeDrive, uploadImageToDrive, deleteImageFromDrive }
