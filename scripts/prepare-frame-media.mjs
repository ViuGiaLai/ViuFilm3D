import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

const source = process.argv[2];
if (!source)
  throw new Error("Pass the original WebP path as the first argument.");
const root = path.resolve("public/assets/avatar-frames/realms/realm-14/v1");
const archive = path.resolve("assets/avatar-frames/sources/realm-14/v1");
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
console.log("Prepared realm-14 media; original archived outside public.");
