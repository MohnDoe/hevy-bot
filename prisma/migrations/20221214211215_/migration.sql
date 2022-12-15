/*
  Warnings:

  - The primary key for the `Guild` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `discordId` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UsersGuilds` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "UsersGuilds" DROP CONSTRAINT "UsersGuilds_guildId_fkey";

-- DropForeignKey
ALTER TABLE "UsersGuilds" DROP CONSTRAINT "UsersGuilds_userId_fkey";

-- DropIndex
DROP INDEX "User_discordId_key";

-- AlterTable
ALTER TABLE "Guild" DROP CONSTRAINT "Guild_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Guild_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Guild_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "discordId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UsersGuilds" DROP CONSTRAINT "UsersGuilds_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "guildId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UsersGuilds_pkey" PRIMARY KEY ("userId", "guildId");

-- AddForeignKey
ALTER TABLE "UsersGuilds" ADD CONSTRAINT "UsersGuilds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersGuilds" ADD CONSTRAINT "UsersGuilds_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
