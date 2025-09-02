-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('TEACHER', 'STUDENT', 'PARENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReceiverType" AS ENUM ('TEACHER', 'STUDENT', 'PARENT', 'ADMIN');

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "receiverId" TEXT NOT NULL,
    "receiverType" "ReceiverType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
