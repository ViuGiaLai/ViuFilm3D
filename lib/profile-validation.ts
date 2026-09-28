export const avatarMaxBytes = 2 * 1024 * 1024;
export const avatarMimeTypes = ["image/jpeg", "image/png", "image/webp"];

export function avatarFileProblem(file: { size: number; type: string }) {
  if (!avatarMimeTypes.includes(file.type))
    return "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.";
  if (file.size <= 0) return "Ảnh đang trống. Vui lòng chọn ảnh khác.";
  if (file.size > avatarMaxBytes)
    return "Ảnh đại diện tối đa 2 MB. Vui lòng chọn ảnh nhỏ hơn.";
  return null;
}

export function hasUploadedAvatar(version: string | null | undefined) {
  return typeof version === "string" && version.length > 0;
}
