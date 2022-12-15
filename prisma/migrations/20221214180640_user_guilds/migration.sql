/*
  Warnings:

  - You are about to drop the column `channelId` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the `_GuildToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GuildToUser" DROP CONSTRAINT "_GuildToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GuildToUser" DROP CONSTRAINT "_GuildToUser_B_fkey";

-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "channelId",
DROP COLUMN "userId",
ADD COLUMN     "workoutChannelId" TEXT;

-- DropTable
DROP TABLE "_GuildToUser";

-- CreateTable
CREATE TABLE "UsersGuilds" (
    "userId" INTEGER NOT NULL,
    "guildId" INTEGER NOT NULL,

    CONSTRAINT "UsersGuilds_pkey" PRIMARY KEY ("userId","guildId")
);

-- AddForeignKey
ALTER TABLE "UsersGuilds" ADD CONSTRAINT "UsersGuilds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersGuilds" ADD CONSTRAINT "UsersGuilds_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
