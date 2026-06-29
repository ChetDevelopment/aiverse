import sharp from "sharp"
import { join } from "path"
const PUBLIC = join(__dirname, "..", "public")
async function check() {
  const buf = await sharp(join(PUBLIC, "icon-192.png")).raw().toBuffer()
  const total = buf.length / 4
  const nonTransparent = []
  for (let i = 0; i < Math.min(buf.length, 4000); i += 4) {
    if (buf[i + 3] > 0) nonTransparent.push({ r: buf[i], g: buf[i+1], b: buf[i+2], a: buf[i+3] })
  }
  console.log("Total pixels:", total)
  console.log("Non-transparent in first 1000 pixels:", nonTransparent.length)
  if (nonTransparent.length > 0) console.log("Sample:", JSON.stringify(nonTransparent[0]))
}
check()
