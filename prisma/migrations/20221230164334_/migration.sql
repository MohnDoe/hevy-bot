/*
  Warnings:

  - You are about to drop the `HevyWorkout` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HevyWorkout" DROP CONSTRAINT "HevyWorkout_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutShares" DROP CONSTRAINT "WorkoutShares_workoutId_fkey";

-- DropTable
DROP TABLE "HevyWorkout";
