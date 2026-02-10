#!/usr/bin/env node

/**
 * i18n Sync Script
 * Detects missing translation keys between locale JSON files.
 *
 * Usage: node scripts/i18n-sync.mjs
 *        node scripts/i18n-sync.mjs --base es  (use Spanish as base)
 */

import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'

const MESSAGES_DIR = resolve(process.cwd(), 'messages')

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return { ...acc, ...flattenKeys(value, fullKey) }
    }
    acc[fullKey] = value
    return acc
  }, {})
}

function main() {
  const args = process.argv.slice(2)
  const baseLocaleArg = args.indexOf('--base')
  const baseLocale = baseLocaleArg !== -1 ? args[baseLocaleArg + 1] : null

  const files = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith('.json'))

  if (files.length < 2) {
    console.log('Need at least 2 locale files to compare.')
    process.exit(0)
  }

  const locales = {}
  for (const file of files) {
    const locale = file.replace('.json', '')
    const content = JSON.parse(readFileSync(join(MESSAGES_DIR, file), 'utf-8'))
    locales[locale] = flattenKeys(content)
  }

  const localeNames = Object.keys(locales)
  const base = baseLocale || localeNames[0]

  if (!locales[base]) {
    console.error(`Base locale "${base}" not found. Available: ${localeNames.join(', ')}`)
    process.exit(1)
  }

  console.log(`\n  i18n Sync Report`)
  console.log(`  Base locale: ${base}`)
  console.log(`  Comparing: ${localeNames.join(', ')}`)
  console.log(`  ${'='.repeat(50)}\n`)

  const baseKeys = Object.keys(locales[base])
  let totalMissing = 0

  for (const locale of localeNames) {
    if (locale === base) continue

    const targetKeys = Object.keys(locales[locale])
    const missingInTarget = baseKeys.filter((k) => !targetKeys.includes(k))
    const extraInTarget = targetKeys.filter((k) => !baseKeys.includes(k))

    if (missingInTarget.length === 0 && extraInTarget.length === 0) {
      console.log(`  [${locale}] All keys synced`)
      continue
    }

    if (missingInTarget.length > 0) {
      console.log(`  [${locale}] Missing ${missingInTarget.length} key(s):`)
      missingInTarget.forEach((k) => {
        console.log(`    - ${k} (value in ${base}: "${locales[base][k]}")`)
      })
      totalMissing += missingInTarget.length
    }

    if (extraInTarget.length > 0) {
      console.log(`  [${locale}] Extra ${extraInTarget.length} key(s) not in ${base}:`)
      extraInTarget.forEach((k) => {
        console.log(`    + ${k}`)
      })
    }

    console.log()
  }

  if (totalMissing === 0) {
    console.log('  All locales are in sync!\n')
  } else {
    console.log(`  Total missing keys: ${totalMissing}`)
    console.log('  Run /translate to generate missing translations.\n')
  }
}

main()
