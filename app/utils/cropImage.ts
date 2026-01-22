export function cropImage(
  img: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const imgAspect = img.width / img.height;
  const targetAspect = targetWidth / targetHeight;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgAspect > targetAspect) {
    // Image is wider than target aspect ratio
    drawHeight = targetHeight;
    drawWidth = img.width * (targetHeight / img.height);
    offsetX = -(drawWidth - targetWidth) / 2;
    offsetY = 0;
  } else {
    // Image is taller than target aspect ratio
    drawWidth = targetWidth;
    drawHeight = img.height * (targetWidth / img.width);
    offsetX = 0;
    offsetY = -(drawHeight - targetHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  return canvas;
}
