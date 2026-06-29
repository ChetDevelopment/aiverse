import sharp from "sharp"
import { join } from "path"

const PUBLIC = join(__dirname, "..", "public")

function iconSvg(size: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 192 192">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6C2BD9"/>
        <stop offset="100%" stop-color="#1E0533"/>
      </linearGradient>
    </defs>
    <rect width="192" height="192" rx="32" fill="url(#g)"/>
    <g fill="white" transform="scale(${size/192})">
      <polygon points="96,45 68,155 124,155"/>
      <rect x="76" y="105" width="40" height="8" rx="3"/>
      <rect x="148" y="45" width="18" height="110" rx="4"/>
    </g>
  </svg>`
}

async function generateIcon(size: number) {
  const svg = iconSvg(size)
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()
  await sharp(buf).toFile(join(PUBLIC, `icon-${size}.png`))
  const info = await sharp(buf).metadata()
  console.log(`icon-${size}.png - ${info.width}x${info.height} (${buf.length} bytes)`)
}

async function main() {
  await generateIcon(192)
  await generateIcon(512)
  console.log("Done")
}

main().catch(console.error)
