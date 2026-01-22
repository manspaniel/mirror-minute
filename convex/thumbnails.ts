"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const generateThumbnail = internalAction({
  args: { shareId: v.id("shares") },
  handler: async (ctx, args): Promise<void> => {
    // Dynamic import of sharp to avoid module analysis issues
    const sharp = (await import("sharp")).default;

    // 1. Get the share to find the photo storage ID
    const share = await ctx.runQuery(internal.shares.getShareInternal, {
      id: args.shareId,
    });
    if (!share?.photoStorageId) return;

    // 2. Get the URL and fetch the original image
    const imageUrl = await ctx.storage.getUrl(share.photoStorageId);
    if (!imageUrl) return;

    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();

    // 3. Resize with sharp to 600x600 square crop
    const thumbnail = await sharp(Buffer.from(imageBuffer))
      .resize(600, 600, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 4. Store thumbnail - convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(thumbnail);
    const thumbnailBlob = new Blob([uint8Array], { type: "image/jpeg" });
    const thumbnailId = await ctx.storage.store(thumbnailBlob);

    // 5. Update share with thumbnail ID
    await ctx.runMutation(internal.shares.setThumbnail, {
      id: args.shareId,
      thumbnailStorageId: thumbnailId,
    });
  },
});
