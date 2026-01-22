// Script para exportar baterías a JSON
// Ejecutar: node -r esbuild-register scripts/export-batteries-to-json.js

import { batteries } from '../src/data/batteries.ts'
import fs from 'fs'

const json = JSON.stringify(batteries, null, 2)
fs.writeFileSync('batteries-initial.json', json)
console.log(`✅ ${batteries.length} baterías exportadas a batteries-initial.json`)
