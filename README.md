# Albion Atlas — six-city crafted item prices

## Upload to GitHub Pages
Replace `index.html`, `app.js`, and `style.css` in the root of the `Albion-Crafting` repository. Keep `items.json` unchanged. Commit changes, wait for GitHub Pages deployment, then hard-refresh (Ctrl+Shift+R).

## New feature
Under Gear Crafting, select an item, tier, enchantment, and quality. Click **Compare six cities**. The site looks up an exact English item name in the ao-bin-dumps item catalogue and requests the Americas (West) AODP market API for Martlock, Fort Sterling, Thetford, Lymhurst, Bridgewatch, and Caerleon. It shows lowest sell orders and highest buy orders, with individual observation ages. Click Sell or Buy to copy that city price into Selling price / item and recalculate profit.

The shared **Maximum price age** setting also applies to finished-item comparisons. Older or missing observations display as unavailable. If automatic item-name matching is ambiguous or missing, enter the verified item ID in **Item ID override**. For enchanted equipment the ID normally ends in `@1`, `@2`, etc. Only one matching base ID is accepted automatically.

The catalogue is fetched from https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json (community-maintained); prices from https://west.albion-online-data.com/api/v2/stats/prices/ . Both services need internet access and may be unavailable, rate-limited, or missing prices. No guarantee of executable prices or order volume. Market prices are player-observed, not exchange quotes. Some unusual items have names that do not match the catalogue; use a verified ID manually. 

## Existing features
Material price fetch, refining, crafting return rates and manual price entry are retained. 20% daily bonus crafting rates are still unspecified and require manual override.
