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

  // Upload both images in parallel
  const uploadImage = async (blob: Blob): Promise<Id<"_storage">> => {
    const uploadUrl = await mutations.generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: blob,
    });
    const { storageId } = await response.json();
    return storageId;
  };

  // Prepare blobs
  const imageBlob = await canvasToBlob(sharedImage);
  const photoBlob = info.photo ? await imageToBlob(info.photo) : null;

  // Upload in parallel
  const [imageStorageId, photoStorageId] = await Promise.all([
    uploadImage(imageBlob),
    photoBlob ? uploadImage(photoBlob) : Promise.resolve(undefined),
  ]);

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
