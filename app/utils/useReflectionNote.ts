import { shareStore, useShareState } from "~/state/share-state";

const MAX_NOTE_LENGTH = 200;

export function useReflectionNote(minimal = false) {
  const state = useShareState();

  const charactersRemaining = Math.max(0, MAX_NOTE_LENGTH - state.note.length);

  let feedbackText = "";
  if (charactersRemaining === MAX_NOTE_LENGTH) {
    if (!minimal) {
      feedbackText = "Max " + MAX_NOTE_LENGTH + " characters";
    }
  } else if (charactersRemaining === 0) {
    feedbackText = "No characters remaining";
  } else {
    feedbackText = state.note.length + "/" + MAX_NOTE_LENGTH;
  }

  return {
    initialValue: shareStore.note,
    setValue: (note: string) => {
      shareStore.note = note;
    },
    feedbackText,
    maxLength: MAX_NOTE_LENGTH,
    percentageUsed: (MAX_NOTE_LENGTH - charactersRemaining) / MAX_NOTE_LENGTH,
  };
}
