import { shareStore } from "~/state/share-state";

export function usePublishImage() {
  return {
    publish(sharedImage?: HTMLCanvasElement) {
      const info = {
        note: shareStore.includeNote ? shareStore.note : "",
        photo: shareStore.images[shareStore.selectedImageIndex] || null,
        theme: shareStore.theme,
      };

      // Push to convex here
    },
  };
}
