import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { nanoid } from "nanoid";
import { tryCatch } from "@shared/try-catch";

export class UploadImageService {
  private s3: S3Client;
  private static instance: UploadImageService;

  constructor() {
    this.s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  uploadImage = async (
    file: Express.Multer.File,
    path: string = "profile"
  ): Promise<string | null> => {
    const fileExtension = file.mimetype.split("/").at(1);
    const fileName = `${nanoid()}.${fileExtension}`;
    const params = {
      Bucket: "media",
      Key: `${path}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const { data: __, error } = await tryCatch(
      this.s3.send(new PutObjectCommand(params))
    );
    if (error) return null;
    return fileName;
  };

  public getSignedUrl = async (path: string): Promise<string | null> => {
    const params = {
      Bucket: "media",
      Key: path,
      Expires: 60 * 60, // 1 hour
    };

    const { data: url, error } = await tryCatch(
      getSignedUrl(this.s3, new GetObjectCommand(params))
    );
    if (error) return null;
    return url;
  };

  public static getInstance(): UploadImageService {
    if (!UploadImageService.instance) {
      UploadImageService.instance = new UploadImageService();
    }
    return UploadImageService.instance;
  }
}
