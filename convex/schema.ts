import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shares: defineTable({
    note: v.string(),
    theme: v.string(),
    imageStorageId: v.id("_storage"),
    photoStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
