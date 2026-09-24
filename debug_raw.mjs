import fs from 'node:fs'
const file = 'server/index.js'
let text = fs.readFileSync(file, 'utf8')
text = text.replace("    const products = getMapData(data).map(normalizeProduct).filter(product => product.link && product.image)", "    const rawItems = getMapData(data)\n    if (process.env.DEBUG_TAOBAO && rawItems[0]) console.log(JSON.stringify(rawItems[0], null, 2))\n    const products = rawItems.map(normalizeProduct).filter(product => product.link && product.image)")
fs.writeFileSync(file, text, { encoding: 'utf8' })
