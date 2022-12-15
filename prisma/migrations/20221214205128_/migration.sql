/*
  Warnings:

  - You are about to drop the column `guildId` on the `Guild` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discordId]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discordId` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Guild_guildId_key";

-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "guildId",
ADD COLUMN     "discordId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Guild_discordId_key" ON "Guild"("discordId");
