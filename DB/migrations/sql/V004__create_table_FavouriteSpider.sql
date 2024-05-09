CREATE TABLE "FavouriteSpider" (
  "favouriteSpiderID" SERIAL PRIMARY KEY,
  "userId" int,
  "spiderId" int,
  "like" int
);