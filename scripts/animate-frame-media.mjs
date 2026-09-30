import sharp from "sharp";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";

// Animate existing cutout artwork without changing its silhouette or alpha hole.
// Usage: node scripts/animate-frame-media.mjs SOURCE FRAME_ID VERSION COLLECTION
const [source, frameId, version, collection = "realms"] = process.argv.slice(2);
if (!source || !/^[a-z][a-z0-9-]*$/.test(frameId ?? "") || frameId === "none")
  throw new Error("Supply a transparent source image and stable frame ID.");
if (!/^[1-9]\d*$/.test(version ?? "")) throw new Error("Invalid version.");
if (
  !["realms", "elements", "beasts", "achievements", "special"].includes(
    collection,
  )
)
  throw new Error("Invalid collection.");
const destination = path.resolve(
  `public/assets/avatar-frames/${collection}/${frameId}/v${version}`,
);
if (
  await access(destination).then(
    () => true,
    () => false,
  )
)
  throw new Error(`Version already exists: ${destination}. Use a new version.`);
const size = 320;
const count = 72;
const delay = 70;
const { data: base } = await sharp(source)
  .resize(size, size, { fit: "contain", background: "#00000000" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const frameBytes = size * size * 4;
if (base[(160 * size + 160) * 4 + 3] !== 0)
  throw new Error("The center of the avatar frame must be transparent.");
const frames = Buffer.alloc(frameBytes * count);
for (let frame = 0; frame < count; frame++) {
  const phase = (frame / count) * Math.PI * 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4;
      const out = frame * frameBytes + p;
      const alpha = base[p + 3];
      frames[out + 3] = alpha;
      if (!alpha) continue;
      const angle = Math.atan2(y - size / 2, x - size / 2);
      const radius = Math.hypot(x - size / 2, y - size / 2) / size;
      // Periodic formulas make the last-to-first transition seamless.
      const sweep = Math.pow(Math.max(0, Math.cos(angle - phase)), 14);
      const pulse = 0.035 * Math.sin(phase * 2);
      let sparkle = 0;
      for (let i = 0; i < 5; i++) {
        const starRadius = 0.39 + 0.025 * Math.sin(i * 2.1);
        // Fixed star positions with phase-based twinkle, not a rotating frame.
        const sx = size / 2 + Math.cos(i * 1.256637) * size * starRadius;
        const sy = size / 2 + Math.sin(i * 1.256637) * size * starRadius;
        const d = Math.hypot(x - sx, y - sy);
        const twinkle = Math.pow(Math.max(0, Math.sin(phase * 2 + i * 1.3)), 6);
        sparkle += Math.exp(-(d * d) / 28) * twinkle;
      }
      const glow =
        sweep * 0.16 * Math.exp(-Math.pow((radius - 0.39) / 0.18, 2));
      for (let c = 0; c < 3; c++) {
        const tint = [0.6, 1, 0.92][c];
        frames[out + c] = Math.max(
          0,
          Math.min(
            255,
            base[p + c] * (1 + pulse) +
              (255 - base[p + c]) * (glow * tint + sparkle * 0.72),
          ),
        );
      }
    }
  }
}
await mkdir(destination, { recursive: true });
await sharp(frames, {
  raw: { width: size, height: size * count, channels: 4, pageHeight: size },
})
  .webp({ quality: 85, effort: 5, loop: 0, delay: Array(count).fill(delay) })
  .toFile(path.join(destination, "animated.webp"));
await sharp(base, { raw: { width: size, height: size, channels: 4 } })
  .webp({ quality: 90 })
  .toFile(path.join(destination, "poster.webp"));
console.log(
  `Created ${count} frames, ${count * delay}ms seamless loop: ${destination}`,
);
