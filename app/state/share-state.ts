import { proxy, ref, useSnapshot } from "valtio";

export const ColourThemes = {
  white: {
    bg: "#ffffff",
    line: "#D8D5FF",
    text: "#2C2953",
    preview: ["#ffffff", "#6357FF"],
  },
  blue: {
    bg: "#6357FF",
    line: "#8A81FF",
    text: "#ffffff",
    preview: ["#6357FF", "#6357FF"],
  },
  orange: {
    bg: "#FF9E8F",
    line: "#FFB3A7",
    text: "#ffffff",
    preview: ["#FF9E8F", "#FF9E8F"],
  },
  black: {
    bg: "#1C1C1E",
    line: "#3A3A3C",
    text: "#FFFFFF",
    preview: ["#1C1C1E", "#3A3A3C"],
  },
};

function createShareStore() {
  const store = proxy({
    note: "",
    images: ref([] as HTMLImageElement[]),
    selectedImageIndex: -1,
    theme: "white" as keyof typeof ColourThemes,
    includeNote: false,
    permissionToShare: false,
    didUpload: false,
  });

  return store;
}

export const shareStore = createShareStore();

export function useShareState() {
  return useSnapshot(shareStore);
}
