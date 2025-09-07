import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
  ): Promise<boolean> => {
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
    if (error) return false;
    return true;
  };

  public static getInstance(): UploadImageService {
    if (!UploadImageService.instance) {
      UploadImageService.instance = new UploadImageService();
    }
    return UploadImageService.instance;
  }
}
