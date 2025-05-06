import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

// Google Drive API setup
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Initialize the Drive API client
export const initializeDriveClient = async () => {
  try {
    // Check if we have credentials
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('Google Drive credentials not found');
    }

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      SCOPES
    );

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Error initializing Google Drive client:', error);
    throw error;
  }
};

// Upload file to Google Drive
export const uploadFileToDrive = async (
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
) => {
  try {
    const drive = await initializeDriveClient();
    
    // Create a readable stream from the file buffer
    const fileStream = new Readable();
    fileStream.push(fileBuffer);
    fileStream.push(null);

    // Upload file to Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType
      },
      media: {
        mimeType: mimeType,
        body: fileStream
      }
    });

    if (!response.data.id) {
      throw new Error('Failed to get file ID from Google Drive');
    }

    // Set file to be publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Get the webViewLink, which is the public URL to the file
    const fileData = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink'
    });

    return {
      fileId: response.data.id,
      webViewLink: fileData.data.webViewLink || '',
      webContentLink: fileData.data.webContentLink || ''
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};

// Get file from Google Drive
export const getFileFromDrive = async (fileId: string) => {
  try {
    const drive = await initializeDriveClient();
    
    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink'
    });

    return fileMetadata.data;
  } catch (error) {
    console.error('Error getting file from Google Drive:', error);
    throw error;
  }
};

// Delete file from Google Drive
export const deleteFileFromDrive = async (fileId: string) => {
  try {
    const drive = await initializeDriveClient();
    
    await drive.files.delete({
      fileId: fileId
    });

    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw error;
  }
};
