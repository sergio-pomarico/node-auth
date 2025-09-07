import { UploadImageService } from "@infrastructure/services/upload-image";
import { inject, injectable } from "inversify";

@injectable()
export class UploadProfileImageUseCase {
  constructor(
    private uploadImageService: UploadImageService = UploadImageService.getInstance()
  ) {}
  run = async (data: {
    id: string;
    buffer: Express.Multer.File;
  }): Promise<boolean> => {
    return this.uploadImageService.uploadImage(data.buffer, data.id);
  };
}
