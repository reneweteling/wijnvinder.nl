# wijn.weteling.nl — WijnWijzer

Dutch wine recommendation platform. Create a taste profile, get personalized wine suggestions with price comparison across 59+ Dutch wine shops.

## Local development

```bash
docker compose up -d          # PostgreSQL + Mailcatcher
pnpm install
pnpm generate && pnpm db:push # Zenstack schema
pnpm db:seed                  # OR: pnpm scrape -- --all --direct
pnpm dev                      # http://localhost:3010 (Next.js + worker via turbo)
```

- App: http://localhost:3010
- Mailcatcher: http://localhost:1080
- PostgreSQL: localhost:5440

## Scraping

```bash
pnpm scrape -- --all              # Enqueue all shops via pg-boss
pnpm scrape -- --all --direct     # Run inline (no pg-boss)
pnpm scrape -- --shop=gall        # Single shop via pg-boss
pnpm scrape -- --enrich           # Vivino enrichment (requires headless browser)
```

## Dokku deployment

```bash
# On server
dokku apps:create wijnvinder
dokku postgres:create wijnvinder-db && dokku postgres:link wijnvinder-db wijnvinder
dokku domains:set wijnvinder wijnvinder.nl www.wijnvinder.nl
dokku ports:add wijnvinder http:80:3000 https:443:3000
dokku letsencrypt:enable wijnvinder

# Locally
git remote add dokku dokku@weteling.com:wijnvinder
git push dokku main:main
```

## Wine Shops

| Shop | URL | Scraping | Affiliate |
|------|-----|----------|-----------|
| Gall & Gall | gall.nl | ✅ | ❌ |
| Wijnvoordeel | wijnvoordeel.nl | ✅ | ❌ |
| Wijnbeurs | wijnbeurs.nl | ✅ | ❌ |
| HunWijn | hunwijn.nl | ❌ | ❌ |
| DrankDozijn | drankdozijn.nl | ❌ | ❌ |
| Grandcruwijnen | grandcruwijnen.nl | ❌ | ❌ |
| Abelswijnen | abelswijnen.nl | ❌ | ❌ |
| Wijnservice | wijnservice.nl | ❌ | ❌ |
| Vinify | vinify.nl | ❌ | ❌ |
| Wijnbroeders | wijnbroeders.nl | ❌ | ❌ |
| Valkwijn | valkwijn.nl | ❌ | ❌ |
| Wijnjuweel | wijnjuweel.nl | ❌ | ❌ |
| Favorietewijn | favorietewijn.nl | ❌ | ❌ |
| Flesjewijn | flesjewijn.com | ❌ | ❌ |
| Albert Heijn | ah.nl | ❌ | ❌ |
| Jumbo | jumbo.com | ❌ | ❌ |
| Bergovino | bergovino.nl | ❌ | ❌ |
| Wijnspecialist | wijnspecialist.nl | ❌ | ❌ |
| Colaris | colaris.nl | ❌ | ❌ |
| Grapedistrict | grapedistrict.nl | ❌ | ❌ |
| Henri Bloem | henribloem.nl | ❌ | ❌ |
| Perfectewijn | perfectewijn.nl | ❌ | ❌ |
| Mondovino | mondovino.nl | ❌ | ❌ |
| Budgetwijnen | budgetwijnen.nl | ❌ | ❌ |
| Bovino | bovino.nl | ❌ | ❌ |
| Dirck3 | dirck3.nl | ❌ | ❌ |
| Biowijnclub | biowijnclub.nl | ❌ | ❌ |
| VinoPura | vinopura.nl | ❌ | ❌ |
| Wijnbox | wijnbox.nl | ❌ | ❌ |
| Taste Club | tasteclub.nl | ❌ | ❌ |
| Baltazar | baltazar.nl | ❌ | ❌ |

## TODO / Roadmap

- [ ] **AI-generated wine descriptions**: Combine all shop descriptions, ratings (shop ratings, Vivino, Hamersma), wine metadata, and tasting notes into an LLM prompt to generate a rich, unified description per wine. Store on `CanonicalWine.description`.
- [ ] **TensorFlow.js image validation**: Use MobileNet (https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) to classify scraped images and verify they're actually wine bottles, not rating badges or awards. Run as a post-scrape validation step.
- [ ] **Vivino enrichment via headless browser**: Current Vivino API returns 403/404. Need Playwright for their SPA to fetch scores.
- [ ] **De Grote Hamersma scores**: Scrape degrotehamersma.nl for expert ratings alongside shop tasting panel scores.
- [ ] **More shop scrapers**: Add remaining 50+ Dutch wine shops (see plan for full list).
- [ ] **Wine description scraping**: Fetch individual product pages for full descriptions (listing pages only have short excerpts).
- [ ] **Scrape pagination**: Wijnvoordeel/Wijnbeurs currently only scrape page 1 (~18 wines each). Need to handle multi-page pagination.
- [ ] **Privacy/about/contact pages**: Currently placeholder links.
- [ ] **Email templates**: Branded HTML verification emails.
