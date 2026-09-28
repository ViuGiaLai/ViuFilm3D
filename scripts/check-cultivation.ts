import assert from "node:assert/strict";
import { cultivationRealms, getCultivation } from "../lib/cultivation";
import { avatarFrames, unlockedFrame } from "../lib/avatar-frames";
import {
  avatarFileProblem,
  avatarMaxBytes,
  hasUploadedAvatar,
} from "../lib/profile-validation";

assert.equal(getCultivation(-20).xp, 0);
assert.equal(getCultivation(Number.NaN).xp, 0);
assert.equal(getCultivation(3900).title, "Huyền Kiếp Trung Kỳ");
assert.equal(getCultivation(5600).title, "Dương Thực Hậu Kỳ");
assert.equal(getCultivation(20000).title, "Tiên Đế Viên Mãn");
assert.equal(getCultivation(20000).nextXp, null);
for (const realm of cultivationRealms) {
  assert.equal(getCultivation(realm.start).realm, realm.name);
  if (realm.start > 0)
    assert.notEqual(getCultivation(realm.start - 1).realm, realm.name);
}
for (let xp = 0; xp <= 12000; xp++) {
  const rank = getCultivation(xp);
  assert.ok(rank.progress >= 0 && rank.progress <= 100);
  assert.ok(rank.nextXp === null || rank.nextXp > xp);
}
assert.equal(
  new Set(avatarFrames.map((frame) => frame.id)).size,
  avatarFrames.length,
);
for (const frame of avatarFrames) {
  assert.equal(unlockedFrame(frame.id, frame.minXp).id, frame.id);
  if (frame.minXp > 0)
    assert.equal(unlockedFrame(frame.id, frame.minXp - 1).id, "none");
}
assert.equal(unlockedFrame("not-a-real-frame", 10000).id, "none");
for (const type of ["image/jpeg", "image/png", "image/webp"]) {
  assert.equal(avatarFileProblem({ size: avatarMaxBytes, type }), null);
}
assert.ok(avatarFileProblem({ size: avatarMaxBytes + 1, type: "image/png" }));
assert.ok(avatarFileProblem({ size: 0, type: "image/png" }));
assert.ok(avatarFileProblem({ size: 20, type: "image/svg+xml" }));
assert.equal(hasUploadedAvatar(null), false);
assert.equal(hasUploadedAvatar(""), false);
assert.equal(hasUploadedAvatar("2026-09-28T00:00:00Z"), true);
console.log(
  `OK: ${cultivationRealms.length} cảnh giới, ${avatarFrames.length - 1} viền; ngưỡng, tiến độ và mở khóa hợp lệ.`,
);
