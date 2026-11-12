# Albion Atlas — older price visibility and crafting material IDs

Upload **app.js**, **index.html**, and **style.css** to your GitHub Pages repository root. Keep items.json unchanged.

## Changes
- Six-city equipment prices now display older observations, marked **(older)** with observed age. Buttons can use those older prices, with a warning.
- Enchanted resource IDs are displayed alongside each recipe material. For example T4_METALBAR_LEVEL2@2, T4_CLOTH_LEVEL2@2. These are generated from the resource naming convention.
- Older material sell observations show their price, age, and timestamp even if the freshness threshold excludes auto-fill. Choose **Any age** to apply old observations automatically.
- Artifacts and special ingredients are flagged as **not verified** rather than assigned guessed market IDs.
- No changes to crafting formulas or equipment ID mapping.

## Limitations
The resource ID convention is validated structurally for the workbook's ordinary Plank, Bar, Leather, and Cloth materials, not independently checked against a live market catalogue for every tier/enchantment. The Albion Data Project may lack observations for actual in-game orders. Older reported prices may not reflect currently available orders.

References: https://github.com/ao-data/ao-bin-dumps and https://www.albion-online-data.com/

## Off-Hands update
Added 18 Off-Hands items from the previous Offhands Website Update dataset (Warrior, Hunter, Mage). Martlock is selected as crafting location for off-hands. The Six-City Crafted Item Marketplace remains removed. Special artifact prices require manual input; verify recipes in game.


## My Journal (browser storage)
The Journal tab tracks crafting batches, partial sales, realized profit, margins, and unsold inventory. It uses `localStorage` under key `albionAtlasJournalV1`; no server or accounts. Users should regularly export JSON backups. Import merges by batch ID. Use the Crafting calculator's Save craft to My Journal button after calculating cost, or enter batches manually. This is an initial version; actual costs may differ from expected returns.

Refining update: displays the bonus city for each resource and automatically calculates refining resource return rates using royal-city base production bonus 18, specialty 40, focus 59, and optional daily 10/20. Manual override remains available.

## Refining journal integration
The Refining tab now includes a Save refining batch to My Journal button. It saves the resource, tier, output quantity, and total estimated production cost (including station fees and expected returns). Sales and partial sales use the same journal workflow as crafting. Existing browser-stored journal records are retained.

## Effective amount refined (spreadsheet parity)
Refining uses available raw and previous-tier inventory, with the workbook's `Refining!Q2:Q8` compounded-return formula: `floor(min(rawAvailable/(rawPerUnit*(1-RRR)), prevAvailable/(previousPerUnit*(1-RRR))))` (T2 omits the previous-tier constraint). The displayed effective output becomes the journal batch quantity; cost and profit are recalculated for that output. This is a mathematical expectation, not guaranteed in-game output.

### Previous-tier refining autofill
The Refining tab now autofills previous-tier refined quantity when raw quantity or tier changes, using floor(raw available / raw-per-refine) times one previous-tier unit (T3/T4=2, T5=3, T6=4, T7/T8=5). Users may manually edit the suggested quantity; changing raw quantity or tier recalculates it. Effective output and journal saved quantities continue using the compounded return-rate calculation.

### Refining enchantment
The Refining tab now includes an enchantment selector (0–4) beside tier. The selected enchantment appears in the material recipe note and is stored in My Journal for refining batches. Prices remain user-entered and must correspond to the chosen enchantment.


General node progression: uses fame per refined resource from the Crafting Fame Database workbook, multiplied by standard category resource counts, enchantment multiplier and optional 1.5x premium. Browser-local per-node current fame and manually entered target; no unverified level threshold assumptions.


## Generalist node progression (V2)

The Crafting tab has an independent Generalist node planner with workbook names and dependent item selection, tier 4-8, enchantment .0-.4, and a Yes/No Premium dropdown. Fame per item = workbook standard resources × tier fame per resource × 2^enchantment × (1.5 if Premium is Yes, otherwise 1). Enter current node level, fame already earned in that level, and target level. Items required = CEILING(MAX(0, cumulative target fame − cumulative current level fame − fame earned in current level) / fame per item). Fame curves reproduce the workbook's decade block interpolation; values are estimates rather than guaranteed in-game data. Progress is saved per node in browser storage. The additional `node-data.js` file must be uploaded with the site.

## Daily crafting bonus update
Crafting daily bonus is manually selectable: No, Yes 10%, or Yes 20%. The 20% values are computed from the existing production-bonus model (bonus-city 33%, other-city 18%, focus adds 59%): RRR = production bonus / (100 + production bonus). Manual return-rate overrides still take priority. Refining already supports all three options.

## November update: journal unit costs and crafting quantities
- My Journal production batches now show Unit crafting cost = total batch cost / quantity produced. Existing saved batches remain compatible; no storage migration.
- Gear crafting recipe ingredients now show the per-craft requirement and total gross requirement for the selected craft quantity (e.g. 8 bars x 5 helmets = 40 bars). Totals are before resource returns; the existing expected-cost calculation still accounts for resource return rates.


## Focus calculator update
- Adds a per-item saved crafting mastery/specialization panel, item-family detection, optional related specialization efficiency, and in-game FCE input.
- Focus per item can always be entered manually, overriding calculated focus. Base focus is manually entered until values are verified.
- Focus totals, 10,000-focus capacity, and batch focus are shown. Saved crafting batches include focusUsed; existing journal backups remain compatible.
- No speculative coefficients are used by default. This version does not automatically fill base focus or infer related specializations; enter in-game FCE for accurate estimates.
- Refining focus is intentionally unchanged.


## Focus reference values and selector update
Focus now uses the same Generalist node and Item crafted catalog as Generalist Node Progression, with separate tier/enchantment selectors. Previously gathered T4–T8 unenchanted base focus values are prefilled for recipes with 8, 16, or 32 normal resources; T4 24-resource recipes also prefill 1,286. The values are historical reference values and should be checked in-game. Other combinations, including enchanted equipment, remain blank rather than extrapolating unverified values. Manual base focus and manual actual focus overrides remain available.


## Journal focus profitability update
- Focus Yes/No on each production batch; Gear Crafting Save copies focus selection and calculated batch focus automatically.
- Manual total focus input and Edit focus action for saved focus batches.
- Realized profit/focus uses realized sales profit and focus allocated to sold units.
- Incremental focus value/focus compares focused batch cost to user-entered no-focus batch cost, allocating both by quantity sold. Missing baseline displays dash, not an invented number.
- Old journal localStorage records and JSON backup version 1 remain compatible. Export a backup before deploying.


## Profit percentage in My Journal
- Added Profit % (on cost) to every batch and a weighted overall Profit % (on cost) KPI.
- Profit % = realized profit / cost allocated to sold items * 100; excludes unsold inventory.
- Existing Net profit margin (of revenue) remains separately labeled.
- Marketplace fees are deducted from sales before calculating profit. Zero allocated cost or no sales shows a dash.
- Journal localStorage schema and existing backups remain unchanged.


## Compact My Journal update
- Overview groups identical item names, tiers and enchantments into expandable rows. The underlying individual batches and sales are unchanged.
- Active Inventory view defaults to batches with remaining unsold units.
- Transaction History preserves individual batch actions, including editing focus and deleting batches.
- Search, date, focus, inventory-status and sorting controls filter the journal browser. Filtered summary tiles update with the selected batches.
- The original all-time KPI cards and focus profitability summary remain unchanged and continue to show all recorded batches.
- Journal data still uses the existing localStorage key and version 1 JSON backup format. Export a backup before updating.

## Homepage redesign (2026-11-12)
The Home section now introduces Albion Atlas with the headline "Craft Smarter. Profit More.", the one-stop-shop tagline, prominent crafting/refining entry points, and six feature cards. The design uses a scoped dark fantasy/gold theme and responsive layouts. Existing calculator, journal, focus, data, and navigation JavaScript files are unchanged. The progression card opens Gear Crafting, where the Generalist Node Progression panel currently lives.
