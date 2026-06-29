import sharp from "sharp"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const SIZES = [192, 512]
const PUBLIC = join(__dirname, "..", "public")

async function generateIcon(size: number, maskable: boolean) {
  const svg = readFileSync(join(PUBLIC, `icon-${size}${maskable ? "-maskable" : ""}.svg`), "utf-8")
  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()
  writeFileSync(join(PUBLIC, `icon-${size}${maskable ? "-maskable" : ""}.png`), png)
  console.log(`icon-${size}${maskable ? "-maskable" : ""}.png`)
}

async function main() {
  for (const size of SIZES) {
    await generateIcon(size, false)
    await generateIcon(size, true)
  }
  console.log("Done")
}

main().catch(console.error)
