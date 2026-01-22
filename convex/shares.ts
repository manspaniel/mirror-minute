import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

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
    const shareId = await ctx.db.insert("shares", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    // Schedule thumbnail generation if photo was uploaded
    if (args.photoStorageId) {
      await ctx.scheduler.runAfter(0, internal.thumbnails.generateThumbnail, {
        shareId,
      });
    }

    return shareId;
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
      // Delete old storage files (ignore errors if files don't exist)
      try {
        await ctx.storage.delete(existing.imageStorageId);
      } catch {
        // File may not exist
      }
      if (existing.photoStorageId) {
        try {
          await ctx.storage.delete(existing.photoStorageId);
        } catch {
          // File may not exist
        }
      }
      if (existing.thumbnailStorageId) {
        try {
          await ctx.storage.delete(existing.thumbnailStorageId);
        } catch {
          // File may not exist
        }
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      thumbnailStorageId: undefined, // Clear old thumbnail
      updatedAt: Date.now(),
    });

    // Schedule new thumbnail generation if photo was uploaded
    if (args.photoStorageId) {
      await ctx.scheduler.runAfter(0, internal.thumbnails.generateThumbnail, {
        shareId: id,
      });
    }

    return id;
  },
});

// List all shares (password protected)
export const listShares = query({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const correctPassword = process.env.WALL_PASSWORD;
    if (!correctPassword || args.password !== correctPassword) {
      return { error: "unauthorized" as const };
    }

    const shares = await ctx.db.query("shares").order("desc").collect();

    // Get URLs for all images
    const sharesWithUrls = await Promise.all(
      shares.map(async (share) => {
        const imageUrl = await ctx.storage.getUrl(share.imageStorageId);
        const photoUrl = share.photoStorageId
          ? await ctx.storage.getUrl(share.photoStorageId)
          : null;
        const thumbnailUrl = share.thumbnailStorageId
          ? await ctx.storage.getUrl(share.thumbnailStorageId)
          : null;
        return {
          ...share,
          imageUrl,
          photoUrl,
          thumbnailUrl,
        };
      }),
    );

    return { shares: sharesWithUrls };
  },
});

// Delete a share (password protected)
export const deleteShare = mutation({
  args: {
    id: v.id("shares"),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const correctPassword = process.env.WALL_PASSWORD;
    if (!correctPassword || args.password !== correctPassword) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db.get(args.id);
    if (existing) {
      // Delete storage files (ignore errors if files don't exist)
      try {
        await ctx.storage.delete(existing.imageStorageId);
      } catch {
        // File may not exist
      }
      if (existing.photoStorageId) {
        try {
          await ctx.storage.delete(existing.photoStorageId);
        } catch {
          // File may not exist
        }
      }
      if (existing.thumbnailStorageId) {
        try {
          await ctx.storage.delete(existing.thumbnailStorageId);
        } catch {
          // File may not exist
        }
      }
      // Delete the document
      await ctx.db.delete(args.id);
    }
  },
});

// Internal: Get share by ID (for thumbnail generation)
export const getShareInternal = internalQuery({
  args: { id: v.id("shares") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Internal: Set thumbnail storage ID
export const setThumbnail = internalMutation({
  args: {
    id: v.id("shares"),
    thumbnailStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      thumbnailStorageId: args.thumbnailStorageId,
    });
  },
});
