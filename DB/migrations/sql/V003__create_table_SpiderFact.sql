CREATE TABLE "SpiderFact" (
  "spiderFactId" SERIAL PRIMARY KEY,
  "spiderId" int,
  "factContent" text NOT NULL
);