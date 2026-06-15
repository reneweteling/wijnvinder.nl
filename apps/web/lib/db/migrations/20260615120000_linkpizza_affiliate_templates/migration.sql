-- Set the LinkPizza affiliate deeplink template for the shops that run via LinkPizza.
-- pzz.to/click redirects through VigLink to the shop, attributed to publisher uid 104014.
-- {url} is our own placeholder, replaced at click time in /uit with the encoded shop URL.
UPDATE "shop"
SET "affiliateLinkTemplate" = 'https://pzz.to/click?uid=104014&referrer=https%3A%2F%2Fwijnvinder.nl&target_url={url}',
    "referralEnabled" = true
WHERE "slug" IN ('wijnbeurs', 'viavina', 'drinkheroes', 'dewijngoeroe')
  AND "affiliateLinkTemplate" IS NULL;
