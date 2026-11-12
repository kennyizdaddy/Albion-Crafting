# Albion Atlas — GitHub Pages website update

Updated using **Albion crafting master - 10 percent daily bonus rates.xlsx**.

## Upload using GitHub's website
1. Open https://github.com/kennyizdaddy/Albion-Crafting and sign in.
2. Open the repository's root folder (the folder containing `index.html`).
3. **Back up** the current files first: click **Code → Download ZIP**.
4. Click **Add file → Upload files** (if you don't see it, use the `+` near the file list).
5. Extract the downloaded Albion Atlas ZIP on your computer. Upload the **contents** of the extracted folder, not the ZIP itself and not an extra parent folder: `index.html`, `style.css`, `app.js`, `items.json`, and optionally `README.md`.
6. If GitHub prompts about files with matching names, allow the replacements. Enter a commit message such as `Update crafting recipes and 10 percent daily bonus rates`, then **Commit changes**.
7. In **Settings → Pages**, confirm the site is deployed from the expected branch (typically `main`) and root (`/`). Wait a minute or two, then refresh https://kennyizdaddy.github.io/Albion-Crafting/ (Ctrl+Shift+R if you see an old version).

## Editing later
- **Change page text and labels:** click `index.html` in GitHub, then the pencil **Edit this file**, edit and **Commit changes**.
- **Change the appearance:** edit `style.css`.
- **Change calculation logic and bonus rates:** edit `app.js`, specifically `craftingRates` and `craftingRate()`.
- **Update item names, bonus cities and recipes:** edit `items.json` (or ask for a new export from the latest Excel workbook).
- **Undo a mistake:** use GitHub's file **History** or repository commit history to restore a previous version.

## Current calculation rules
- No daily bonus, in bonus city: no focus **24.8%**, focus **47.9%**.
- No daily bonus, other city: no focus **15.2%**, focus **43.5%**.
- 10% daily bonus, in bonus city: no focus **30%**, focus **50.4%**.
- 10% daily bonus, other city: no focus **21.8%**, focus **46.5%**.
- 20% daily bonus: **not yet provided**; the website shows unavailable rather than guessing.
- Manual return rate overrides are available for crafting and refining.

## Notes
- The website is static; uploading a revised Excel file alone will **not** change the website. `items.json` and `app.js` must be updated when the workbook changes.
- All prices are manual; there is no live market feed.
- Refining is an estimate using the previous version's inputs, not a full port of every Excel formula.
- The site's cost model uses expected material consumption and excludes artifact returns. Check item recipes against the game before making large trades.

## Crafting cost fix (November 2026)
Crafting cost now calculates without a selling price. Enter a price for each required material, choose Buy or Refine where relevant, and set the crafting city, focus, and daily bonus. Selling price is only needed for profit. If the 20% daily bonus is selected, supply a manual return-rate override until those rates are provided.

### Troubleshooting crafting cost
Selling price is optional. Enter the Buy price for every recipe material, including artifacts, or select Refine and enter its self-refined price. Select No or Yes 10% for Daily Bonus; Yes 20% needs a manual return rate until supplied. Replace both `app.js` and `index.html` in the repository root, commit, then hard refresh.


## Live market prices (Americas)

Open Gear crafting, choose an item and tier/enchantment, select a **Buy materials in** city, and press **Fetch market prices**. Recognized refined resources are filled using the latest reported **sell_price_min** (the price to buy the item) at normal quality. The age limit defaults to 3 days. Stale/missing/unknown IDs are not filled; enter those manually. You may overwrite any fetched value. The API is community-contributed, not a guaranteed current market quote.

Only basic resource IDs are mapped: `T{tier}_PLANKS`, `T{tier}_METALBAR`, `T{tier}_CLOTH`, `T{tier}_LEATHER`, and `T{tier}_STONEBLOCK`, with `@{enchantment}` for enchanted resources. Artifact IDs are not guessed. This version does not auto-fetch the crafted item's selling price. No API key or paid hosting is required, but browser CORS and API rate limits may affect availability.

Source: https://west.albion-online-data.com/api-docs

### GitHub upload

Replace **index.html**, **app.js**, and **style.css** in the root of the existing repository; retain **items.json** (included for convenience). Commit changes to the GitHub Pages publishing branch. Refresh with Ctrl+Shift+R.
