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
