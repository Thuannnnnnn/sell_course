import { Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config();
export class AzureBlobUtility {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly logger = new Logger(AzureBlobUtility.name);

  constructor(private readonly connectionString: string) {
    if (!connectionString) {
      throw new Error('Azure Storage connection string is not defined');
    }
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  async upload(
    containerName: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blobName = `${uuidv4()}-${path.basename(file.originalname)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    this.logger.log(`Uploading file to Azure Blob Storage: ${blobName}`);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    const url = blockBlobClient.url;
    this.logger.log(`File uploaded successfully. URL: ${url}`);
    return url;
  }
}

export async function azureUpload(file: Express.Multer.File): Promise<string> {
  const AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;
  const AZURE_STORAGE_CONTAINER_NAME =
    process.env.AZURE_STORAGE_CONTAINER_NAME || 'default-container';

  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage connection string is not defined');
  }

  const azureBlobUtility = new AzureBlobUtility(
    AZURE_STORAGE_CONNECTION_STRING,
  );
  return azureBlobUtility.upload(AZURE_STORAGE_CONTAINER_NAME, file);
}