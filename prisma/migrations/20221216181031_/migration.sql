/*
  Warnings:

  - The primary key for the `HevyWorkout` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hevyId` on the `HevyWorkout` table. All the data in the column will be lost.
  - The primary key for the `WorkoutShares` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "WorkoutShares" DROP CONSTRAINT "WorkoutShares_workoutId_fkey";

-- DropIndex
DROP INDEX "HevyWorkout_hevyId_key";

-- AlterTable
ALTER TABLE "HevyWorkout" DROP CONSTRAINT "HevyWorkout_pkey",
DROP COLUMN "hevyId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HevyWorkout_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "HevyWorkout_id_seq";

-- AlterTable
ALTER TABLE "WorkoutShares" DROP CONSTRAINT "WorkoutShares_pkey",
ALTER COLUMN "workoutId" SET DATA TYPE TEXT,
ADD CONSTRAINT "WorkoutShares_pkey" PRIMARY KEY ("workoutId", "guildId", "channelId");

-- AddForeignKey
ALTER TABLE "WorkoutShares" ADD CONSTRAINT "WorkoutShares_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "HevyWorkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
