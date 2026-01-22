import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { appState } from "~/state/app-state";
import { ColourThemes, shareStore, useShareState } from "~/state/share-state";
import { Button } from "~/ui/Button";
import { Checkbox } from "~/ui/Checkbox";
import { Switch } from "~/ui/Switch";
import { cn } from "~/utils/tw";
import { useEscape } from "~/utils/useEscape";
import { useReflectionNote } from "~/utils/useReflectionNote";
import { ShareImage } from "./ShareImage";
import { useIsMobile } from "~/utils/useIsMobile";

export function ShareScreen() {
  useEscape(() => {
    appState.closeShare();
  });

  const generator = useRef<() => Promise<HTMLCanvasElement>>(null!);

  const isMobile = useIsMobile();
  const hasNativeShare = useMemo(
    () => !!navigator.canShare && !!navigator.share,
    [],
  );

  async function download() {
    const canvas = await generator.current();
    const link = document.createElement("a");
    link.download = "mirror-minute-share.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function share() {
    const canvas = await generator.current();
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], "mirror-minute-share.png", {
          type: "image/png",
        });
        try {
          await navigator.share({
            files: [file],
            title: "My Mirror Minute",
            text: "Check out my Mirror Minute creation!",
          });
        } catch (error) {
          console.error("Error sharing:", error);
          download();
        }
      }
    });
  }

  return (
    <div className="fixed inset-0">
      <div className="flex items-center justify-center gap-20 h-full">
        {/* Preview */}
        <div className="flex-none md:ml-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "none" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="aspect-[303/540] flex-none md:h-[80vh]"
          >
            <ShareImage />
          </motion.div>
        </div>
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.8 } }}
          exit={{ opacity: 0 }}
          className="md:w-[40vw] flex-none"
        >
          <Controls />
          <div className="flex gap-3 mt-8">
            <Button onClick={download}>Download</Button>
            {hasNativeShare && <Button onClick={share}>Share</Button>}
          </div>
        </motion.div>
      </div>

      {/* Exportable preview */}
      <div className="absolute top-0 left-0 pointer-events-none opacity-0">
        <ShareImage forExport={true} generateRef={generator} />
      </div>
    </div>
  );
}

function Controls() {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Colour Theme">
        <Swatches />
      </Field>
      <Field label="Image">
        <ImageSelector />
      </Field>
      <Field label="Reflection">
        <Reflection />
      </Field>
      <div>
        <Permissions />
      </div>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-serif text-lg text-indigo-950">{props.label}</div>
      <div>{props.children}</div>
    </div>
  );
}

function Swatches() {
  const share = useShareState();

  return (
    <div className="flex gap-3">
      {Object.entries(ColourThemes).map(([key, theme]) => (
        <div
          key={key}
          className="size-4 md:size-10 rounded-full border-indigo-950 cursor-pointer border outline-2 outline-offset-2 transition-all"
          style={{
            backgroundColor: theme.preview[0],
            borderColor: theme.preview[1],
            outlineColor:
              share.theme === key ? theme.preview[1] : "transparent",
          }}
          onClick={() => {
            shareStore.theme = key as keyof typeof ColourThemes;
          }}
        ></div>
      ))}
    </div>
  );
}

function ImageSelector() {
  const share = useShareState();

  return (
    <div className="flex gap-3">
      <SelectableImage
        selected={share.selectedImageIndex === -1}
        onSelect={() => {
          shareStore.selectedImageIndex = -1;
        }}
      />
      {(share.images as HTMLImageElement[]).map((img, index) => (
        <SelectableImage
          key={index}
          image={img}
          selected={share.selectedImageIndex === index}
          onSelect={() => {
            shareStore.selectedImageIndex = index;
          }}
        />
      ))}
    </div>
  );
}

function SelectableImage(props: {
  image?: HTMLImageElement;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.image && ref.current) {
      ref.current.style.backgroundImage = `url(${props.image.src})`;
      ref.current.style.backgroundSize = "cover";
      ref.current.style.backgroundPosition = "center";
    } else if (ref.current) {
      ref.current.style.backgroundImage = "none";
    }
  }, [props.image]);

  return (
    <div
      ref={ref}
      className={cn(
        "w-[72px] aspect-[72/96] rounded-lg border-indigo-200 cursor-pointer border outline-2 outline-offset-2 transition-colors relative flex items-center justify-center",
        props.selected ? "outline-indigo-500" : "outline-transparent",
      )}
      onClick={props.onSelect}
    >
      {!props.image && (
        <span className="font-sans uppercase text-[10px]">None</span>
      )}
    </div>
  );
}

const MAX_NOTE_LENGTH = 200;

function Reflection() {
  const state = useShareState();

  const reflection = useReflectionNote();

  return (
    <div className="flex flex-col items-start">
      <label className="flex gap-2 items-center cursor-pointer">
        <Switch
          checked={state.includeNote}
          onChange={(checked) => {
            shareStore.includeNote = checked;
          }}
        />
        <span className="font-serif text-xl">Show personal note</span>
      </label>
      <AnimatePresence mode="wait" initial={false}>
        {state.includeNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full"
          >
            <div className="pt-4">
              <div className="relative border border-indigo-950/20 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                <textarea
                  className="w-full h-24 px-3 py-2 placeholder:text-indigo-950/40 border-none resize-none field-sizing-content outline-indigo-500 font-serif text-lg outline-none"
                  placeholder="The mirror minute made me feel..."
                  defaultValue={reflection.initialValue}
                  onChange={(e) => {
                    reflection.setValue(e.target.value);
                  }}
                  maxLength={reflection.maxLength}
                ></textarea>
                <div
                  className={"text-indigo-950/60 text-xs px-3 py-2 text-right"}
                >
                  {reflection.feedbackText}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Permissions() {
  const state = useShareState();

  return (
    <div>
      <label className="flex gap-2 items-start cursor-pointer">
        <Checkbox
          checked={state.permissionToShare}
          onChange={(checked) => {
            shareStore.permissionToShare = checked;
          }}
        />
        <span className="font-serif text-lg text-balance max-w-[30em] -mt-1">
          I give permission for Laugh Lines to save a copy of my image and
          reflection for reproduction in campaign materials.
        </span>
      </label>
    </div>
  );
}
