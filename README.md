# WijnVinder.nl

Dutch wine recommendation platform. Create a taste profile, get personalized wine suggestions with price comparison across 10+ Dutch wine shops.

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
dokku ps:scale wijnvinder web=1 worker=1

# Locally
git remote add dokku dokku@weteling.com:wijnvinder
git push dokku main:main
```

## Wine Shops

TradeTracker - Luuc bellen wanneer hij live staat

| Shop           | URL               | Scraping | Affiliate | Network                                     |
| -------------- | ----------------- | -------- | --------- | ------------------------------------------- |
| Gall & Gall    | gall.nl           | ✅        | ✅         | Awin / direct (€1/order, €20 new customer)  |
| Wijnvoordeel   | wijnvoordeel.nl   | ✅        | ✅         | TradeTracker (4.55%, 30d cookie)             |
| Wijnbeurs      | wijnbeurs.nl      | ✅        | ✅         | TradeTracker / LinkPizza                     |
| DrankDozijn    | drankdozijn.nl    | ❌        | ✅         | TradeTracker                                 |
| Albert Heijn   | ah.nl             | ❌        | ✅         | Partnerize (own program)                     |
| Viavina        | viavina.nl        | ❌        | ✅         | TradeTracker / LinkPizza                     |
| Fanster        | fanster.nl        | ❌        | ✅         | TradeTracker                                 |
| Topdrinks      | topdrinks.nl      | ❌        | ✅         | TradeTracker / LinkPizza                     |
| Bulwijn        | bulwijn.nl        | ❌        | ✅         | Direct (own program)                         |
| WijnSpijs      | wijnspijs.nl      | ❌        | ✅         | Direct (own program)                         |
| Drink Heroes   | drinkheroes.nl    | ❌        | ✅         | LinkPizza                                    |
| De Wijngoeroe  | dewijngoeroe.nl   | ❌        | ✅         | LinkPizza                                    |
| HunWijn        | hunwijn.nl        | ❌        | ❌         |                                              |
| Grandcruwijnen | grandcruwijnen.nl | ❌        | ❌         |                                              |
| Abelswijnen    | abelswijnen.nl    | ❌        | ❌         |                                              |
| Wijnservice    | wijnservice.nl    | ❌        | ❌         |                                              |
| Vinify         | vinify.nl         | ❌        | ❌         |                                              |
| Wijnbroeders   | wijnbroeders.nl   | ❌        | ❌         |                                              |
| Valkwijn       | valkwijn.nl       | ❌        | ❌         |                                              |
| Wijnjuweel     | wijnjuweel.nl     | ❌        | ❌         |                                              |
| Favorietewijn  | favorietewijn.nl  | ❌        | ❌         |                                              |
| Flesjewijn     | flesjewijn.com    | ❌        | ❌         |                                              |
| Jumbo          | jumbo.com         | ❌        | ❌         |                                              |
| Bergovino      | bergovino.nl      | ❌        | ❌         |                                              |
| Wijnspecialist | wijnspecialist.nl | ❌        | ❌         |                                              |
| Colaris        | colaris.nl        | ❌        | ❌         |                                              |
| Grapedistrict  | grapedistrict.nl  | ❌        | ❌         |                                              |
| Henri Bloem    | henribloem.nl     | ❌        | ❌         |                                              |
| Perfectewijn   | perfectewijn.nl   | ❌        | ❌         |                                              |
| Mondovino      | mondovino.nl      | ❌        | ❌         |                                              |
| Budgetwijnen   | budgetwijnen.nl   | ❌        | ❌         |                                              |
| Bovino         | bovino.nl         | ❌        | ❌         |                                              |
| Dirck3         | dirck3.nl         | ❌        | ❌         |                                              |
| Biowijnclub    | biowijnclub.nl    | ❌        | ❌         |                                              |
| VinoPura       | vinopura.nl       | ❌        | ❌         |                                              |
| Wijnbox        | wijnbox.nl        | ❌        | ❌         |                                              |
| Taste Club     | tasteclub.nl      | ❌        | ❌         |                                              |
| Baltazar       | baltazar.nl       | ❌        | ❌         |                                              |

### Affiliate networks

**TradeTracker** is the main network for Dutch wine/drinks shops. One publisher account covers Wijnvoordeel, Wijnbeurs, DrankDozijn, Viavina, Fanster, Topdrinks, and DrankKoning under the "Eten en drinken" category. Sign up at tradetracker.com and search campaigns for "wijn". Commissions are typically 4-8% with 30-100 day cookies.

**LinkPizza** aggregates 4,800+ affiliate programs including wine shops like Wijnbeurs, Viavina, Topdrinks, Drink Heroes, and De Wijngoeroe. Useful as a secondary network to cover shops not directly on TradeTracker.

**Awin** covers Gall & Gall. Their partner program is also available directly at gall.nl/partnerprogramma (contact: affiliate_marketing@gall.nl). Fixed €1 per order, €20 for new customers.

**Partnerize** is used by Albert Heijn for their own affiliate program. Sign up at signup.partnerize.com/signup/nl/albertheijn. Commission is a percentage of basket value, scaling with order size.

**Direct programs**: Bulwijn and WijnSpijs run their own affiliate programs without a network middleman.

Note: Many smaller shops (marked ❌) may still have unlisted programs — check their footers for "affiliate" or "partnerprogramma" links, or contact them directly. The affiliate landscape changes frequently; verify current availability on the network portals.

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


## Credentials
Resend - info@wijnvinder.nl
https://linkpizza.com/ - rene@weteling.com
https://affiliate.tradetracker.com/ - reneweteling
