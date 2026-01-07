import { UploadImageService } from "@infrastructure/services/upload-image";
import { tryCatch } from "@shared/try-catch";
import { inject, injectable } from "inversify";
import { UserRepository } from "@domain/repositories/user-repository";

@injectable()
export class UploadProfileImageUseCase {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository,
    private uploadImageService: UploadImageService = UploadImageService.getInstance()
  ) {}
  run = async (data: {
    id: string;
    buffer: Express.Multer.File;
  }): Promise<boolean> => {
    const { data: fileName, error } = await tryCatch(
      this.uploadImageService.uploadImage(data.buffer, data.id)
    );
    if (error) return false;
    const isUpdated = await this.userRepository.addProfileImage(
      data.id,
      fileName!
    );
    return isUpdated;
  };
}
