/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_name]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."user_username_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "imageUrl",
DROP COLUMN "username",
ADD COLUMN     "image_url" VARCHAR(500),
ADD COLUMN     "user_name" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_user_name_key" ON "user"("user_name");
