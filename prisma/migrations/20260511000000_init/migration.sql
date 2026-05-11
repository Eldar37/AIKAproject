CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Bishkek',
    "language" TEXT NOT NULL DEFAULT 'ru',
    "experienceLevel" TEXT NOT NULL DEFAULT 'beginner',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "niche" TEXT,
    "description" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'START',
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "budget" TEXT,
    "targetAudience" TEXT,
    "channels" TEXT[],
    "firstSaleDone" BOOLEAN NOT NULL DEFAULT false,
    "monthlyRevenue" DOUBLE PRECISION,
    "goals" TEXT[],
    "aiMode" TEXT NOT NULL DEFAULT 'START_MODE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL DEFAULT 'START',
    "stageProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "daysActive" INTEGER NOT NULL DEFAULT 0,
    "milestones" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'START_MODE',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "longest" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "BusinessProfile"("userId");
CREATE INDEX "Task_userId_createdAt_idx" ON "Task"("userId", "createdAt");
CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");
CREATE UNIQUE INDEX "Progress_userId_key" ON "Progress"("userId");
CREATE INDEX "AIConversation_userId_updatedAt_idx" ON "AIConversation"("userId", "updatedAt");
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");
CREATE INDEX "Goal_userId_completed_idx" ON "Goal"("userId", "completed");
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");
CREATE UNIQUE INDEX "Achievement_userId_type_key" ON "Achievement"("userId", "type");
CREATE INDEX "Achievement_userId_unlockedAt_idx" ON "Achievement"("userId", "unlockedAt");
CREATE INDEX "ContentHistory_userId_createdAt_idx" ON "ContentHistory"("userId", "createdAt");

ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentHistory" ADD CONSTRAINT "ContentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
