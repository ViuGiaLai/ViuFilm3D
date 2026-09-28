import sharp from "sharp";
import { mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";

const source = process.argv[2];
const frameId = process.argv[3] ?? "realm-14";
const version = process.argv[4] ?? "1";
const collection = process.argv[5] ?? "realms";
const scale = Number(process.argv[6] ?? "1.35");
if (!source)
  throw new Error("Pass the original WebP path as the first argument.");
if (!/^[a-z][a-z0-9-]*$/.test(frameId) || frameId === "none")
  throw new Error(
    "Use a stable frame ID from lib/avatar-frames.ts (e.g. realm-0).",
  );
if (!/^[1-9]\d*$/.test(version))
  throw new Error("Version must be a positive integer.");
if (
  !["realms", "elements", "beasts", "achievements", "special"].includes(
    collection,
  )
)
  throw new Error("Unknown collection.");
if (!Number.isFinite(scale) || scale < 1 || scale > 2)
  throw new Error("Scale must be between 1 and 2.");
const root = path.resolve(
  `public/assets/avatar-frames/${collection}/${frameId}/v${version}`,
);
const archive = path.resolve(
  `assets/avatar-frames/sources/${frameId}/v${version}`,
);
for (const target of [root, archive]) {
  const exists = await access(target).then(
    () => true,
    () => false,
  );
  if (exists)
    throw new Error(
      `Already exists: ${target}. Use a new version; existing assets are preserved.`,
    );
}
await sharp(source, { animated: true }).metadata();
await mkdir(root, { recursive: true });
await mkdir(archive, { recursive: true });
await copyFile(source, path.join(archive, "original.webp"));
await sharp(source, { animated: true })
  .resize({ width: 320 })
  .webp({ quality: 82, effort: 5 })
  .toFile(path.join(root, "animated.webp"));
await sharp(source)
  .resize({ width: 320 })
  .webp({ quality: 85 })
  .toFile(path.join(root, "poster.webp"));
console.log(
  `Prepared ${frameId} v${version}; original archived outside public.`,
);
console.log(
  `Add or replace this ONE entry in lib/avatar-frame-media.ts:\n  "${frameId}": frameMedia("${collection}", "${frameId}", ${version}, ${scale}),`,
);
