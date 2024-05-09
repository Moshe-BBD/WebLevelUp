CREATE TABLE "User" (
  "userId" SERIAL PRIMARY KEY,
  "emailAddress" varchar(255) NOT NULL,
  "username" varchar(255) NOT NULL,
  "githubId" varchar(255)
);
