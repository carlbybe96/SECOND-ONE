/** Recadre une photo en carré centré et la compresse (JPEG) pour le stockage local. */
export async function resizeImage(file: File, max = 480): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choisis une image (JPG ou PNG).");
  if (file.size > 12 * 1024 * 1024) throw new Error("Image trop lourde (12 Mo maximum).");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Impossible de lire cette image."));
      img.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const out = Math.min(max, side);
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Traitement de l'image impossible sur ce navigateur.");
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, out, out);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
