# Albion Atlas - item ID mapping update

## GitHub update
Replace **app.js** in your existing repository with the file from this package. Keep your existing index.html, style.css and items.json. Commit to main, wait for GitHub Pages to publish, then hard-refresh (Ctrl+Shift+R).

## What changed
The six-city comparison now builds a mapping for every name in your 232-item `items.json` list from the community Albion item catalogue. It removes tier prefixes such as **Adept's** before matching and deduplicates IDs by their tier-independent suffix. It then creates the correct ID for the chosen tier and enchantment. It does **not** guess when names are missing or ambiguous; the manual item ID field remains available. The comparison reports the number of automatically matched names.

**Note:** This is an automatic catalogue-based mapping system, not a manually verified list of 232 static IDs. The actual match count depends on the catalogue available in the visitor's browser. Live API calls and browser compatibility have not been verified here.

## Test
Choose Heavy Crossbow, tier 4, enchantment 1, and click Compare six cities. If catalogue naming matches, it should request `T4_2HCROSSBOW@1`. If it still fails, use that ID in the override field and report the displayed error.
