import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { shareStore } from "~/state/share-state";

export function usePublishImage() {
  const generateUploadUrl = useMutation(api.shares.generateUploadUrl);
  const createShare = useMutation(api.shares.createShare);
  const updateShare = useMutation(api.shares.updateShare);

  return {
    publish(sharedImage?: HTMLCanvasElement) {
      // Run in background, don't await
      publishAsync(sharedImage, {
        generateUploadUrl,
        createShare,
        updateShare,
      }).catch((error) => {
        console.error("Failed to publish share:", error);
      });
    },
  };
}

async function publishAsync(
  sharedImage: HTMLCanvasElement | undefined,
  mutations: {
    generateUploadUrl: () => Promise<string>;
    createShare: (args: {
      note: string;
      theme: string;
      imageStorageId: Id<"_storage">;
      photoStorageId?: Id<"_storage">;
    }) => Promise<Id<"shares">>;
    updateShare: (args: {
      id: Id<"shares">;
      note: string;
      theme: string;
      imageStorageId: Id<"_storage">;
      photoStorageId?: Id<"_storage">;
    }) => Promise<Id<"shares">>;
  },
) {
  const info = {
    note: shareStore.includeNote ? shareStore.note : "",
    photo: shareStore.images[shareStore.selectedImageIndex] || null,
    theme: shareStore.theme,
  };

  if (!sharedImage) return;

  // 1. Upload the generated canvas image
  const imageUploadUrl = await mutations.generateUploadUrl();
  const imageBlob = await canvasToBlob(sharedImage);
  const imageResponse = await fetch(imageUploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/png" },
    body: imageBlob,
  });
  const { storageId: imageStorageId } = await imageResponse.json();

  // 2. Upload original photo if exists
  let photoStorageId: Id<"_storage"> | undefined;
  if (info.photo) {
    const photoUploadUrl = await mutations.generateUploadUrl();
    const photoBlob = await imageToBlob(info.photo);
    const photoResponse = await fetch(photoUploadUrl, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: photoBlob,
    });
    const result = await photoResponse.json();
    photoStorageId = result.storageId;
  }

  // 3. Create or update share
  const shareData = {
    note: info.note,
    theme: info.theme,
    imageStorageId,
    photoStorageId,
  };

  let shareId: Id<"shares">;
  if (shareStore.shareId) {
    // Update existing
    shareId = await mutations.updateShare({
      id: shareStore.shareId as Id<"shares">,
      ...shareData,
    });
  } else {
    // Create new
    shareId = await mutations.createShare(shareData);
  }

  shareStore.shareId = shareId;
}

// Helper: canvas to blob
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to convert canvas to blob"));
    }, "image/png");
  });
}

// Helper: HTMLImageElement to blob
async function imageToBlob(img: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(canvas);
}
