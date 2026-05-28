import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { usePublishImage } from "~/utils/usePublishImage";
import {
  Palette,
  Image,
  ImageOff,
  PenLine,
  PenOff,
  ArrowLeft,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as Dialog from "@radix-ui/react-dialog";
import { Tracking } from "~/utils/tracking";
import { Link } from "react-router";

export function ShareScreen() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileShareScreen /> : <DesktopShareScreen />;
}

// ============================================
// DESKTOP SHARE SCREEN (existing layout)
// ============================================

function DesktopShareScreen() {
  useEscape(() => {
    appState.closeShare();
  });

  const generator = useRef<() => Promise<HTMLCanvasElement>>(null!);
  const publish = usePublishImage();

  const hasNativeShare = useMemo(
    () => !!navigator.canShare && !!navigator.share,
    [],
  );

  async function download() {
    Tracking.trackEvent("Share - Downloaded (Desktop)", {
      theme: shareStore.theme,
      hasImage: shareStore.selectedImageIndex !== -1,
      hasNote: shareStore.includeNote,
      permissionGranted: shareStore.permissionToShare,
    });
    const canvas = await generator.current();
    const link = document.createElement("a");
    link.download = "mirror-minute-share.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    if (shareStore.permissionToShare) {
      publish.publish(canvas);
    }
  }

  async function share() {
    Tracking.trackEvent("Share - Shared", {
      theme: shareStore.theme,
      hasImage: shareStore.selectedImageIndex !== -1,
      hasNote: shareStore.includeNote,
      permissionGranted: shareStore.permissionToShare,
    });
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
          Tracking.trackEvent("Share - Sharing Error", {
            error: error instanceof Error ? error.message : String(error),
          });
          download();
        }
      }
    });

    if (shareStore.permissionToShare) {
      publish.publish(canvas);
    }
  }

  return (
    <div className="fixed inset-0">
      {/* Header with back button */}
      <div className="flex-none p-4 flex items-center fixed top-0 left-0 z-10">
        <button
          onClick={() => {
            Tracking.trackEvent("Share - Back to Summary");
            appState.closeShare();
          }}
          className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors cursor-pointer inline-flex font-sans uppercase gap-2 font-normal text-indigo-950"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

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
          <DesktopControls />
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

function DesktopControls() {
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

// ============================================
// MOBILE SHARE SCREEN (new layout)
// ============================================

function MobileShareScreen() {
  useEscape(() => {
    appState.closeShare();
  });
  const state = useShareState();

  const generator = useRef<() => Promise<HTMLCanvasElement>>(null!);
  const publish = usePublishImage();
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  async function handleShareOrDownload(withPermission: boolean) {
    Tracking.trackEvent("Share - Shared", {
      permissionGranted: withPermission,
      theme: shareStore.theme,
      hasImage: shareStore.selectedImageIndex !== -1,
      hasNote: shareStore.includeNote,
    });
    shareStore.permissionToShare = withPermission;
    setPermissionDialogOpen(false);

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
          // Fallback to download
          const link = document.createElement("a");
          link.download = "mirror-minute-share.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      }
    });

    if (withPermission) {
      publish.publish(canvas);
    }
  }

  const theme = ColourThemes[state.theme];

  return (
    <div
      className="fixed inset-0 bg-[#f2f2fb] flex flex-col"
      style={
        {
          "--bg": theme.bg,
          "--text": theme.text,
          "--border": theme.preview[1],
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="flex-none p-4 flex items-center fixed top-0 left-0 right-0 z-10">
        <button
          onClick={() => {
            appState.closeShare();
            Tracking.trackEvent("Share - Back to Summary");
          }}
          className="p-2 -ml-2 rounded-full active:bg-black/10 transition-colors cursor-pointer inline-flex font-sans uppercase gap-2 font-normal"
          style={{ color: theme.text }}
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      {/* Control buttons */}
      <div className="absolute top-4 right-4 z-10">
        <MobileControlButtons />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center min-h-0 bg-blue-300">
        <div className="relative flex items-center justify-center h-full w-full flex-none">
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex items-center justify-center relative flex-none"
          >
            <ShareImage className="border-0" />
          </motion.div>
        </div>
      </div>

      {/* Share button */}
      <div
        className="flex-none border-t border-black/10 p-4 flex"
        style={{ background: theme.bg }}
      >
        <Button
          onClick={() => {
            Tracking.trackEvent("Share - Asked for Share Permision (Mobile)");
            setPermissionDialogOpen(true);
          }}
          className="!w-full !flex-1"
          variant={
            state.theme === "blue"
              ? "light"
              : state.theme === "orange"
                ? "light"
                : "default"
          }
        >
          Share or Download
        </Button>
      </div>

      {/* Exportable preview */}
      <div className="absolute top-0 left-0 pointer-events-none opacity-0">
        <ShareImage forExport={true} generateRef={generator} />
      </div>

      {/* Permission dialog */}
      <PermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        onShare={handleShareOrDownload}
      />
    </div>
  );
}

function MobileControlButtons() {
  const share = useShareState();
  const hasImage = share.selectedImageIndex !== -1;
  const hasNote = share.includeNote;
  const isWhiteTheme = share.theme === "white";

  const whiteShadow =
    "shadow-[0_2px_10px_rgba(99,87,255,0.15),0_0_0_1px_rgba(99,87,255,0.1)]";

  const buttonClasses = cn(
    "size-8 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer transition-all",
    "active:scale-90 active:bg-indigo-100",
    isWhiteTheme && whiteShadow,
  );

  const popoverClasses = cn(
    "bg-white rounded-xl shadow-xl z-50",
    isWhiteTheme && whiteShadow,
  );

  const arrowClasses = cn(
    "fill-white",
    isWhiteTheme && "drop-shadow-[0_0_1px_rgba(99,87,255,0.3)]",
  );

  return (
    <div className="flex flex-row gap-2">
      {/* Colour theme */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className={buttonClasses}>
            <Palette className="w-5 h-5 text-indigo-600" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={cn(popoverClasses, "p-3")}
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <MobileSwatches />
            <Popover.Arrow className={arrowClasses} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Image selector */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className={cn(buttonClasses, !hasImage && "opacity-60")}>
            {hasImage ? (
              <Image className="w-5 h-5 text-indigo-600" />
            ) : (
              <ImageOff className="w-5 h-5 text-indigo-400" />
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={cn(popoverClasses, "p-3")}
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <MobileImageSelector />
            <Popover.Arrow className={arrowClasses} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Note/reflection */}
      <NotePopover
        hasNote={hasNote}
        buttonClasses={buttonClasses}
        popoverClasses={popoverClasses}
        arrowClasses={arrowClasses}
      />
    </div>
  );
}

function NotePopover({
  hasNote,
  buttonClasses,
  popoverClasses,
  arrowClasses,
}: {
  hasNote: boolean;
  buttonClasses: string;
  popoverClasses: string;
  arrowClasses: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className={cn(buttonClasses, !hasNote && "opacity-60")}>
          {hasNote ? (
            <PenLine className="w-5 h-5 text-indigo-600" />
          ) : (
            <PenOff className="w-5 h-5 text-indigo-400" />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(popoverClasses, "p-4 w-[calc(100vw-2rem)] max-w-sm")}
          side="bottom"
          align="end"
          sideOffset={8}
        >
          <MobileReflection onClose={() => setOpen(false)} />
          <Popover.Arrow className={arrowClasses} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function MobileSwatches() {
  const share = useShareState();

  return (
    <div className="flex gap-2">
      {Object.entries(ColourThemes).map(([key, theme]) => (
        <div
          key={key}
          className="size-8 rounded-full border cursor-pointer outline-2 outline-offset-2 transition-all"
          style={{
            backgroundColor: theme.preview[0],
            borderColor: theme.preview[1],
            outlineColor:
              share.theme === key ? theme.preview[1] : "transparent",
          }}
          onClick={() => {
            Tracking.trackEvent("Share - Theme Changed", { theme: key });
            shareStore.theme = key as keyof typeof ColourThemes;
          }}
        />
      ))}
    </div>
  );
}

function MobileImageSelector() {
  const share = useShareState();

  return (
    <div className="flex gap-2">
      <MobileSelectableImage
        selected={share.selectedImageIndex === -1}
        onSelect={() => {
          Tracking.trackEvent("Share - Image Selected", { imageIndex: -1 });
          shareStore.selectedImageIndex = -1;
        }}
      />
      {(share.images as HTMLImageElement[]).map((img, index) => (
        <MobileSelectableImage
          key={index}
          image={img}
          selected={share.selectedImageIndex === index}
          onSelect={() => {
            Tracking.trackEvent("Share - Image Selected", {
              imageIndex: index,
            });
            shareStore.selectedImageIndex = index;
          }}
        />
      ))}
    </div>
  );
}

function MobileSelectableImage(props: {
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
        "w-12 h-16 rounded-lg border cursor-pointer outline-2 outline-offset-2 transition-colors relative flex items-center justify-center",
        props.selected
          ? "border-indigo-500 outline-indigo-500"
          : "border-indigo-200 outline-transparent",
      )}
      onClick={props.onSelect}
    >
      {!props.image && (
        <span className="font-sans uppercase text-[8px] text-indigo-400">
          None
        </span>
      )}
    </div>
  );
}

function MobileReflection({ onClose }: { onClose: () => void }) {
  const state = useShareState();
  const reflection = useReflectionNote();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex gap-2 items-center cursor-pointer">
        <Switch
          checked={state.includeNote}
          onChange={(checked) => {
            Tracking.trackEvent("Share - Note Toggle", { enabled: checked });
            shareStore.includeNote = checked;
          }}
        />
        <span className="font-serif text-sm">Show personal note</span>
      </label>
      <AnimatePresence mode="wait" initial={false}>
        {state.includeNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="relative border border-indigo-950/20 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
              <textarea
                className="w-full h-20 px-3 py-2 placeholder:text-indigo-950/40 border-none resize-none outline-none font-serif text-[16px] rounded-xl"
                placeholder="How did it feel to look at yourself?"
                defaultValue={reflection.initialValue}
                onChange={(e) => {
                  reflection.setValue(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                maxLength={reflection.maxLength}
              />
              <div className="text-indigo-950/60 text-[10px] px-3 py-1 text-right">
                {reflection.feedbackText}
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-indigo-500 text-white font-sans uppercase text-[10px] tracking-wider rounded-full shadow-md hover:bg-indigo-600 active:scale-95 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PermissionDialog({
  open,
  onOpenChange,
  onShare,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (withPermission: boolean) => void;
}) {
  const [permissionChecked, setPermissionChecked] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-6 max-w-sm w-[90vw] z-50">
          <Dialog.Title className="font-sans uppercase text-sm tracking-wider text-indigo-950 mb-3">
            While we've got you
          </Dialog.Title>
          <Dialog.Description asChild>
            <div className="font-serif text-indigo-950/80 mb-5 text-base leading-relaxed">
              We'd love to feature your Mirror Minute in our campaign! If you're
              happy for us to use your creation, tick the box below.
            </div>
          </Dialog.Description>
          <label className="flex gap-3 items-start cursor-pointer mb-6">
            <Checkbox
              checked={permissionChecked}
              onChange={setPermissionChecked}
            />
            <span className="font-serif text-sm text-indigo-950 text-balance -mt-0.5">
              I give permission for Laugh Lines to save and use a copy of my
              image and reflection for reproduction in campaign materials,
              including social media and future creative projects. I understand
              this is optional and I can withdraw my consent at any time.{" "}
              <Link target="_blank" to="/privacy" className="underline">
                Privacy Policy
              </Link>
              {" · "}
              <Link target="_blank" to="/terms" className="underline">
                Terms of Use
              </Link>
            </span>
          </label>
          <Button onClick={() => onShare(permissionChecked)} className="w-full">
            Share
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================
// SHARED COMPONENTS (used by desktop)
// ============================================

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
            Tracking.trackEvent("Share - Theme Changed", { theme: key });
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
          Tracking.trackEvent("Share - Image Selected", { imageIndex: -1 });
          shareStore.selectedImageIndex = -1;
        }}
      />
      {(share.images as HTMLImageElement[]).map((img, index) => (
        <SelectableImage
          key={index}
          image={img}
          selected={share.selectedImageIndex === index}
          onSelect={() => {
            Tracking.trackEvent("Share - Image Selected", {
              imageIndex: index,
            });
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

function Reflection() {
  const state = useShareState();
  const reflection = useReflectionNote();

  return (
    <div className="flex flex-col items-start">
      <label className="flex gap-2 items-center cursor-pointer">
        <Switch
          checked={state.includeNote}
          onChange={(checked) => {
            Tracking.trackEvent("Share - Note Toggle", { enabled: checked });
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
                  placeholder="How did it feel to look at yourself?"
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
            Tracking.trackEvent("Share - Permission Checkbox", {
              granted: checked,
            });
            shareStore.permissionToShare = checked;
          }}
        />
        <span className="font-serif text-lg text-balance max-w-[30em] -mt-1">
          I give permission for Laugh Lines to save and use a copy of my image
          and reflection for reproduction in campaign materials, including
          social media and future creative projects. I understand this is
          optional and I can withdraw my consent at any time.{" "}
          <Link target="_blank" to="/privacy" className="underline">
            Privacy Policy
          </Link>
          {" · "}
          <Link target="_blank" to="/terms" className="underline">
            Terms of Use
          </Link>
        </span>
      </label>
    </div>
  );
}
