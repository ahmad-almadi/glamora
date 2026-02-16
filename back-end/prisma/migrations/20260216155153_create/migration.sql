-- CreateTable
CREATE TABLE "ahmad" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,

    CONSTRAINT "ahmad_pkey" PRIMARY KEY ("id")
);
