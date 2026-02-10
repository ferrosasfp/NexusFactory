#!/usr/bin/env node

import { runWizard } from './lib/prompts.mjs'
import { scaffold } from './lib/scaffold.mjs'

const args = process.argv.slice(2)

// Quick mode: create-nexus my-project web2|hybrid
const projectNameArg = args[0] && !args[0].startsWith('-') ? args[0] : null
const modeArg = args[1] === 'web2' || args[1] === 'hybrid' ? args[1] : null

const config = await runWizard(projectNameArg, modeArg)
await scaffold(config)
