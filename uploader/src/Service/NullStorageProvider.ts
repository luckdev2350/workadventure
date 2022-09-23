import {StorageProvider,Location} from "./StorageProvider";
import {TempStorageProvider} from "./TempStorageProvider";

export class NullStorageProvider implements StorageProvider,TempStorageProvider {
    deleteFileById(fileId: string): Promise<void> {
        throw new Error("S3 and Redis for upload file are not defined");
    }

    upload(fileUuid: string, chunks: Buffer, mimeType: string | undefined): Promise<Location> {
        throw new Error("S3 and Redis for upload file are not defined");
    }
    get(fileId: string): Promise<Buffer | undefined | null> {
        throw new Error("S3 and Redis for upload file are not defined");
    }

    uploadTempFile(audioMessageId: string, buffer: Buffer, expireSecond: number): Promise<unknown> {
        throw new Error("No providers setup for temporary storage");
    }

    getExternalDownloadLink(fileId: string): Promise<string> {
        throw new Error("S3 and Redis for upload file are not defined");
    }
}
