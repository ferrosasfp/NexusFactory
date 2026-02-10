# /translate - i18n Translation Sync

> Compare locale JSON files and generate missing translations.

## Instructions

1. Read `messages/en.json` and `messages/es.json`
2. Flatten both to dot-notation keys
3. Find keys present in one but missing in the other
4. For each missing key:
   - Show the key and its value in the source locale
   - Generate the translation for the target locale
5. Present all translations for user approval before writing

## Output Format

```
Missing in es.json (found in en.json):
  - auth.newFeature: "New Feature" → "Nueva Funcionalidad"
  - wallet.gasEstimate: "Gas Estimate" → "Estimación de Gas"

Missing in en.json (found in es.json):
  - (none)

Apply translations? (Y/n)
```

## Rules

- Never auto-write without showing diff first
- Preserve JSON structure (nested objects, not flat)
- Keep ICU message format variables intact: `{name}`, `{count}`
- Use natural translations, not literal word-by-word
- Run `npm run i18n:sync` first to see the report
