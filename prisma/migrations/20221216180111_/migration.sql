-- CreateTable
CREATE TABLE "HevyWorkout" (
    "id" SERIAL NOT NULL,
    "hevyId" TEXT NOT NULL,
    "hevyShortId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HevyWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutShares" (
    "workoutId" INTEGER NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sharedType" TEXT,

    CONSTRAINT "WorkoutShares_pkey" PRIMARY KEY ("workoutId","guildId","channelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "HevyWorkout_hevyId_key" ON "HevyWorkout"("hevyId");

-- CreateIndex
CREATE UNIQUE INDEX "HevyWorkout_hevyShortId_key" ON "HevyWorkout"("hevyShortId");

-- AddForeignKey
ALTER TABLE "HevyWorkout" ADD CONSTRAINT "HevyWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutShares" ADD CONSTRAINT "WorkoutShares_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "HevyWorkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutShares" ADD CONSTRAINT "WorkoutShares_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
