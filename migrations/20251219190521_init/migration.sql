-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "lastLogin" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ip" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fullOverview" TEXT,
    "industry" TEXT NOT NULL,
    "githubRepo" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL,
    "scenarios" TEXT NOT NULL,
    "deploymentModes" TEXT NOT NULL,
    "deploymentDifficulty" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "encryptionLevel" TEXT NOT NULL,
    "tunnelType" TEXT NOT NULL,
    "packageSigned" BOOLEAN NOT NULL DEFAULT true,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "qualityScore" INTEGER NOT NULL,
    "securityVerdict" TEXT NOT NULL,
    "codeMaintainability" TEXT NOT NULL,
    "isAudited" BOOLEAN NOT NULL DEFAULT false,
    "auditDate" DATETIME,
    "executionPlan" TEXT,
    "verticalLLMConfig" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DigitalAgent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "solutionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarSeed" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "saturation" INTEGER NOT NULL DEFAULT 0,
    "currentTask" TEXT,
    "trainingHistory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DigitalAgent_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
