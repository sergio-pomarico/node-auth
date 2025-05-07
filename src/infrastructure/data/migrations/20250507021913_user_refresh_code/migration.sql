-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jwt_secret" TEXT,
ADD COLUMN     "password_reset_code_expires_at" TIMESTAMP(3);
