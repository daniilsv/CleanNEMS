#!/usr/bin/env node
const path = require('path')
const sao = require('sao')

const generator = path.resolve(__dirname, './')
const outDir = path.resolve(process.argv[2] || '.')

console.log(`> Generating CleanNEMS project in ${outDir}`)

sao({ generator, outDir, logLevel: 2 })
    .run()
    .catch((err) => {
        console.trace(err)
        process.exit(1)
    })