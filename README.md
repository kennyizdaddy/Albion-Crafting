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
