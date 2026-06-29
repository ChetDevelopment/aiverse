import sharp from "sharp"
import { join } from "path"

const PUBLIC = join(__dirname, "..", "public")

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6C2BD9"/><stop offset="100%" stop-color="#1E0533"/>
  </linearGradient></defs>
  <rect width="48" height="48" rx="8" fill="url(#g)"/>
  <polygon points="24,11 17,39 31,39" fill="white"/>
  <rect x="19" y="26" width="10" height="2" rx="1" fill="white"/>
  <rect x="37" y="11" width="4" height="28" rx="1" fill="white"/>
</svg>`

async function main() {
  await sharp(Buffer.from(svg)).resize(48, 48).png().toFile(join(PUBLIC, "favicon.ico"))
  await sharp(Buffer.from(svg)).resize(32, 32).png().toFile(join(PUBLIC, "favicon-32.png"))
  await sharp(Buffer.from(svg)).resize(16, 16).png().toFile(join(PUBLIC, "favicon-16.png"))
  console.log("Done")
}

main().catch(console.error)
