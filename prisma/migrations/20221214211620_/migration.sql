/*
  Warnings:

  - You are about to drop the column `discordId` on the `Guild` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Guild_discordId_key";

-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "discordId";
