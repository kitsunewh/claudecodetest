import { google } from 'googleapis';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let drive = null;
let isInitialized = false;

/**
 * Initializes Google Drive API client
 */
export async function initGoogleDrive() {
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_DRIVE_CLIENT_ID ||
        process.env.GOOGLE_DRIVE_CLIENT_ID === 'your_client_id_here') {
      console.warn('⚠️  Google Drive not configured. Images will not be uploaded to Drive.');
      console.warn('   To enable: Set up Google Cloud credentials in .env file');
      return;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      process.env.GOOGLE_DRIVE_REDIRECT_URI
    );

    // Try to load saved tokens
    try {
      const tokenData = await fs.readFile('./token.json', 'utf8');
      const tokens = JSON.parse(tokenData);
      oauth2Client.setCredentials(tokens);

      drive = google.drive({ version: 'v3', auth: oauth2Client });
      isInitialized = true;
      console.log('✅ Google Drive initialized successfully');
    } catch (error) {
      console.warn('⚠️  No saved Google Drive token found. Run setup to authenticate.');
      console.warn('   Images will be stored locally only until Drive is configured.');
    }

  } catch (error) {
    console.error('Google Drive initialization error:', error.message);
  }
}

/**
 * Uploads a file to Google Drive
 * @param {string} filePath - Local path to the file
 * @param {string} fileName - Name for the file in Drive
 * @returns {Promise<string>} URL to the uploaded file
 */
export async function uploadToGoogleDrive(filePath, fileName) {
  if (!isInitialized || !drive) {
    throw new Error('Google Drive not initialized. Please configure credentials.');
  }

  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : []
    };

    const media = {
      mimeType: 'image/jpeg',
      body: createReadStream(filePath)
    };

    console.log('Uploading to Google Drive:', fileName);

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    // Make the file publicly accessible (optional)
    try {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permError) {
      console.warn('Could not make file public:', permError.message);
    }

    console.log('✅ File uploaded to Drive:', response.data.id);

    return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;

  } catch (error) {
    console.error('Google Drive upload error:', error.message);
    throw new Error(`Failed to upload to Google Drive: ${error.message}`);
  }
}

/**
 * Generates OAuth2 URL for user authentication
 * @returns {string} Authorization URL
 */
export function getAuthUrl() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  );

  const scopes = ['https://www.googleapis.com/auth/drive.file'];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
}

/**
 * Exchanges authorization code for tokens
 * @param {string} code - Authorization code from OAuth2 flow
 * @returns {Promise<Object>} Token data
 */
export async function getTokenFromCode(code) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  // Save tokens to file
  await fs.writeFile('./token.json', JSON.stringify(tokens, null, 2));

  return tokens;
}
