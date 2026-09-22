/**
 * NagarNetra Edge PWA - Realtime In-RAM Bystander and Face Anonymizer
 * DPDP Act 2023 Compliant: No raw un-blurred image leaves memory.
 */
self.onmessage = function (e) {
  const { imageData, faceBoxes } = e.data;
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Apply heavy Gaussian/Pixelation blur directly on RAM pixel buffer over detected faces/bystanders
  for (const box of faceBoxes) {
    const x1 = Math.max(0, Math.floor(box.x));
    const y1 = Math.max(0, Math.floor(box.y));
    const x2 = Math.min(width, Math.floor(box.x + box.width));
    const y2 = Math.min(height, Math.floor(box.y + box.height));
    const blockSize = 12;

    for (let py = y1; py < y2; py += blockSize) {
      for (let px = x1; px < x2; px += blockSize) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = 0; dy < blockSize && py + dy < y2; dy++) {
          for (let dx = 0; dx < blockSize && px + dx < x2; dx++) {
            const idx = ((py + dy) * width + (px + dx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          for (let dy = 0; dy < blockSize && py + dy < y2; dy++) {
            for (let dx = 0; dx < blockSize && px + dx < x2; dx++) {
              const idx = ((py + dy) * width + (px + dx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
            }
          }
        }
      }
    }
  }

  self.postMessage({ anonymizedImageData: imageData });
};
