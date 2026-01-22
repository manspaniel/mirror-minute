import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create a new share
export const createShare = mutation({
  args: {
    note: v.string(),
    theme: v.string(),
    imageStorageId: v.id("_storage"),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("shares", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing share (overwrite)
export const updateShare = mutation({
  args: {
    id: v.id("shares"),
    note: v.string(),
    theme: v.string(),
    imageStorageId: v.id("_storage"),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Get existing share to delete old files
    const existing = await ctx.db.get(id);
    if (existing) {
      // Delete old storage files
      await ctx.storage.delete(existing.imageStorageId);
      if (existing.photoStorageId) {
        await ctx.storage.delete(existing.photoStorageId);
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});
