import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ColourThemes } from "~/state/share-state";
import { Button } from "~/ui/Button";
import {
  Settings,
  Trash2,
  Download,
  Image,
  ImageOff,
  SlidersHorizontal,
  Grid3X3,
  List,
  LogOut,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { Route } from "./+types/wall";

const PASSWORD_STORAGE_KEY = "mirror-minute-wall-password";
const PASSWORD_EXPIRY_KEY = "mirror-minute-wall-password-expiry";
const PASSWORD_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const DISPLAY_MODE_KEY = "mirror-minute-wall-display-mode";
const SHOW_WITHOUT_PHOTOS_KEY = "mirror-minute-wall-show-without-photos";

type DisplayMode = "grid" | "list";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Share Wall | Mirror Minute" },
    { name: "description", content: "View shared Mirror Minute creations" },
  ];
}

function getStoredPassword(): string | null {
  if (typeof window === "undefined") return null;
  const expiry = localStorage.getItem(PASSWORD_EXPIRY_KEY);
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
    localStorage.removeItem(PASSWORD_EXPIRY_KEY);
    return null;
  }
  return localStorage.getItem(PASSWORD_STORAGE_KEY);
}

function storePassword(password: string) {
  localStorage.setItem(PASSWORD_STORAGE_KEY, password);
  localStorage.setItem(
    PASSWORD_EXPIRY_KEY,
    (Date.now() + PASSWORD_TTL_MS).toString(),
  );
}

function clearStoredPassword() {
  localStorage.removeItem(PASSWORD_STORAGE_KEY);
  localStorage.removeItem(PASSWORD_EXPIRY_KEY);
}

function getStoredDisplayMode(): DisplayMode {
  if (typeof window === "undefined") return "grid";
  return (localStorage.getItem(DISPLAY_MODE_KEY) as DisplayMode) || "grid";
}

function storeDisplayMode(mode: DisplayMode) {
  localStorage.setItem(DISPLAY_MODE_KEY, mode);
}

function getStoredShowWithoutPhotos(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SHOW_WITHOUT_PHOTOS_KEY);
  return stored === null ? true : stored === "true";
}

function storeShowWithoutPhotos(show: boolean) {
  localStorage.setItem(SHOW_WITHOUT_PHOTOS_KEY, show.toString());
}

export default function Wall() {
  const [password, setPassword] = useState("");
  const [submittedPassword, setSubmittedPassword] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [showWithoutPhotos, setShowWithoutPhotos] = useState(true);

  // Load stored password and display mode on mount
  useEffect(() => {
    const stored = getStoredPassword();
    if (stored) {
      setSubmittedPassword(stored);
    }
    setDisplayMode(getStoredDisplayMode());
    setShowWithoutPhotos(getStoredShowWithoutPhotos());
    setInitialized(true);
  }, []);

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    storeDisplayMode(mode);
  };

  const handleShowWithoutPhotosChange = (show: boolean) => {
    setShowWithoutPhotos(show);
    storeShowWithoutPhotos(show);
  };

  const result = useQuery(
    api.shares.listShares,
    submittedPassword ? { password: submittedPassword } : "skip",
  );

  const isUnauthorized = result && "error" in result;
  const shares = result && "shares" in result ? result.shares : null;

  // Clear stored password if it was wrong
  useEffect(() => {
    if (isUnauthorized && submittedPassword) {
      clearStoredPassword();
    }
  }, [isUnauthorized, submittedPassword]);

  const handleLogin = () => {
    storePassword(password);
    setSubmittedPassword(password);
  };

  const handleLogout = () => {
    clearStoredPassword();
    setSubmittedPassword("");
    setPassword("");
  };

  if (!initialized) {
    return null;
  }

  const isLoggedIn = submittedPassword && !isUnauthorized;

  return (
    <div className="min-h-screen bg-[#f2f2fb]">
      {isLoggedIn && (
        <TopBar
          onLogout={handleLogout}
          displayMode={displayMode}
          onDisplayModeChange={handleDisplayModeChange}
          showWithoutPhotos={showWithoutPhotos}
          onShowWithoutPhotosChange={handleShowWithoutPhotosChange}
        />
      )}

      <div className="px-4 sm:px-8 pt-4 pb-8">
        {!submittedPassword || isUnauthorized ? (
          <div className="pt-20 max-w-sm mx-auto">
            <h1 className="font-sans uppercase text-3xl text-indigo-950 mb-8">
              Share Wall
            </h1>
            <PasswordForm
              password={password}
              setPassword={setPassword}
              onSubmit={handleLogin}
              error={isUnauthorized ?? false}
            />
          </div>
        ) : shares ? (
          <ShareList
            shares={shares}
            password={submittedPassword}
            displayMode={displayMode}
            showWithoutPhotos={showWithoutPhotos}
          />
        ) : (
          <div className="text-indigo-950/60 pt-20">Loading...</div>
        )}
      </div>
    </div>
  );
}

function TopBar({
  onLogout,
  displayMode,
  onDisplayModeChange,
  showWithoutPhotos,
  onShowWithoutPhotosChange,
}: {
  onLogout: () => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  showWithoutPhotos: boolean;
  onShowWithoutPhotosChange: (show: boolean) => void;
}) {
  return (
    <div className="sticky top-0 z-50 bg-[#f2f2fb]/90 backdrop-blur-sm border-b border-indigo-200">
      <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="font-sans uppercase text-sm text-indigo-950">
          <span className="opacity-60">Mirror Minute</span>
          <span className="opacity-40 mx-2">/</span>
          <span>Share Wall</span>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-4">
          <DisplayModeToggle
            displayMode={displayMode}
            onDisplayModeChange={onDisplayModeChange}
          />
          <button
            onClick={() => onShowWithoutPhotosChange(!showWithoutPhotos)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              showWithoutPhotos
                ? "bg-indigo-100 text-indigo-600"
                : "bg-indigo-200 text-indigo-400"
            }`}
            title={
              showWithoutPhotos
                ? "Showing all uploads"
                : "Hiding uploads without photos"
            }
          >
            {showWithoutPhotos ? (
              <Image className="w-4 h-4" />
            ) : (
              <ImageOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onLogout}
            className="font-serif text-sm text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <MobileMenu
            onLogout={onLogout}
            displayMode={displayMode}
            onDisplayModeChange={onDisplayModeChange}
            showWithoutPhotos={showWithoutPhotos}
            onShowWithoutPhotosChange={onShowWithoutPhotosChange}
          />
        </div>
      </div>
    </div>
  );
}

function DisplayModeToggle({
  displayMode,
  onDisplayModeChange,
}: {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-indigo-100 rounded-lg p-1">
      <button
        onClick={() => onDisplayModeChange("grid")}
        className={`p-2 rounded-md transition-colors cursor-pointer ${
          displayMode === "grid"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-indigo-400 hover:text-indigo-600"
        }`}
        title="Grid view"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDisplayModeChange("list")}
        className={`p-2 rounded-md transition-colors cursor-pointer ${
          displayMode === "list"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-indigo-400 hover:text-indigo-600"
        }`}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

function MobileMenu({
  onLogout,
  displayMode,
  onDisplayModeChange,
  showWithoutPhotos,
  onShowWithoutPhotosChange,
}: {
  onLogout: () => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  showWithoutPhotos: boolean;
  onShowWithoutPhotosChange: (show: boolean) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white rounded-xl shadow-xl p-2 z-50 flex flex-col gap-1"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className={`flex items-center gap-2 px-3 py-2 text-sm font-serif rounded-lg cursor-pointer outline-none ${
              displayMode === "grid"
                ? "bg-indigo-50 text-indigo-600"
                : "text-indigo-950 hover:bg-indigo-50"
            }`}
            onSelect={() => onDisplayModeChange("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
            Grid View
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={`flex items-center gap-2 px-3 py-2 text-sm font-serif rounded-lg cursor-pointer outline-none ${
              displayMode === "list"
                ? "bg-indigo-50 text-indigo-600"
                : "text-indigo-950 hover:bg-indigo-50"
            }`}
            onSelect={() => onDisplayModeChange("list")}
          >
            <List className="w-4 h-4" />
            List View
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-indigo-100 my-1" />
          <DropdownMenu.Item
            className={`flex items-center gap-2 px-3 py-2 text-sm font-serif rounded-lg cursor-pointer outline-none ${
              showWithoutPhotos
                ? "bg-indigo-50 text-indigo-600"
                : "text-indigo-950 hover:bg-indigo-50"
            }`}
            onSelect={() => onShowWithoutPhotosChange(!showWithoutPhotos)}
          >
            {showWithoutPhotos ? (
              <Image className="w-4 h-4" />
            ) : (
              <ImageOff className="w-4 h-4" />
            )}
            {showWithoutPhotos ? "Show All" : "Photos Only"}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-indigo-100 my-1" />
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm font-serif text-red-600 rounded-lg cursor-pointer hover:bg-red-50 outline-none"
            onSelect={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function PasswordForm({
  password,
  setPassword,
  onSubmit,
  error,
}: {
  password: string;
  setPassword: (p: string) => void;
  onSubmit: () => void;
  error: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="max-w-sm"
    >
      <label className="block mb-2 font-serif text-lg text-indigo-950">
        Enter password to view
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 border border-indigo-200 rounded-xl font-serif text-lg outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
        placeholder="Password"
        autoFocus
      />
      {error && (
        <p className="mb-2 text-red-500 font-serif text-sm">
          Incorrect password
        </p>
      )}
      <div className="mt-4">
        <Button type="submit">View Wall</Button>
      </div>
    </form>
  );
}

type Share = {
  _id: Id<"shares">;
  note: string;
  theme: string;
  imageUrl: string | null;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: number;
};

function ShareList({
  shares,
  password,
  displayMode,
  showWithoutPhotos,
}: {
  shares: Share[];
  password: string;
  displayMode: DisplayMode;
  showWithoutPhotos: boolean;
}) {
  const filteredShares = showWithoutPhotos
    ? shares
    : shares.filter((share) => share.photoUrl || share.thumbnailUrl);

  if (filteredShares.length === 0) {
    return (
      <p className="text-indigo-950/60 font-serif text-lg pt-20 text-center">
        {shares.length === 0
          ? "No shares yet."
          : "No shares with photos. Toggle the filter to see all."}
      </p>
    );
  }

  if (displayMode === "list") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredShares.map((share) => (
          <ShareListItem key={share._id} share={share} password={password} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6">
      {filteredShares.map((share) => (
        <ShareCard key={share._id} share={share} password={password} />
      ))}
    </div>
  );
}

function ShareCard({ share, password }: { share: Share; password: string }) {
  const theme =
    ColourThemes[share.theme as keyof typeof ColourThemes] ||
    ColourThemes.white;

  const date = new Date(share.createdAt);
  const formattedDate = date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="rounded-xl overflow-hidden shadow-md flex flex-col"
      style={{
        backgroundColor: theme.bg,
        borderWidth: 2,
        borderColor: theme.preview[1],
      }}
    >
      <div className="aspect-square relative bg-black/10">
        {share.thumbnailUrl || share.photoUrl ? (
          <img
            src={share.thumbnailUrl || share.photoUrl || ""}
            alt="Shared photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="font-serif text-sm opacity-50"
              style={{ color: theme.text }}
            >
              No photo
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <CardMenu share={share} password={password} />
        </div>
      </div>
      <div className="p-3 sm:p-4 flex-1" style={{ color: theme.text }}>
        {share.note ? (
          <p className="font-serif text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-3">
            "{share.note}"
          </p>
        ) : (
          <p className="font-serif text-xs sm:text-sm mb-2 sm:mb-3 opacity-50">
            No note
          </p>
        )}
        <p className="font-sans uppercase text-[10px] sm:text-xs opacity-70">
          {formattedDate} at {formattedTime}
        </p>
      </div>
    </div>
  );
}

function ShareListItem({
  share,
  password,
}: {
  share: Share;
  password: string;
}) {
  const theme =
    ColourThemes[share.theme as keyof typeof ColourThemes] ||
    ColourThemes.white;

  const date = new Date(share.createdAt);
  const formattedDate = date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="rounded-xl overflow-hidden shadow-md flex items-stretch"
      style={{
        backgroundColor: theme.bg,
        borderWidth: 2,
        borderColor: theme.preview[1],
      }}
    >
      <div className="aspect-square w-20 sm:w-[100px] flex-shrink-0 relative bg-black/10">
        {share.thumbnailUrl || share.photoUrl ? (
          <img
            src={share.thumbnailUrl || share.photoUrl || ""}
            alt="Shared photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center aspect-square">
            <span
              className="font-serif text-xs opacity-50"
              style={{ color: theme.text }}
            >
              No photo
            </span>
          </div>
        )}
      </div>
      <div
        className="flex-1 p-3 sm:p-4 flex flex-col justify-center min-w-0"
        style={{ color: theme.text }}
      >
        {share.note ? (
          <p className="font-serif text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
            "{share.note}"
          </p>
        ) : (
          <p className="font-serif text-xs sm:text-sm mb-1 sm:mb-2 opacity-50">
            No note
          </p>
        )}
        <p className="font-sans uppercase text-[10px] sm:text-xs opacity-70">
          {formattedDate} at {formattedTime}
        </p>
      </div>
      <div className="flex items-center pr-3 sm:pr-4">
        <CardMenu share={share} password={password} />
      </div>
    </div>
  );
}

function CardMenu({ share, password }: { share: Share; password: string }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteShare = useMutation(api.shares.deleteShare);

  const handleDelete = async () => {
    await deleteShare({ id: share._id, password });
    setDeleteDialogOpen(false);
  };

  const handleDownloadPhoto = () => {
    if (share.photoUrl) {
      downloadFile(share.photoUrl, `mirror-minute-photo-${share._id}.png`);
    }
  };

  const handleDownloadGraphic = () => {
    if (share.imageUrl) {
      downloadFile(share.imageUrl, `mirror-minute-share-${share._id}.png`);
    }
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors cursor-pointer">
            <Settings className="w-4 h-4 text-white" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[180px] bg-white rounded-xl shadow-xl p-2 z-50"
            sideOffset={5}
            align="end"
          >
            {share.photoUrl && (
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm font-serif text-indigo-950 rounded-lg cursor-pointer hover:bg-indigo-50 outline-none"
                onSelect={handleDownloadPhoto}
              >
                <Image className="w-4 h-4" />
                Download Photo
              </DropdownMenu.Item>
            )}
            {share.imageUrl && (
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm font-serif text-indigo-950 rounded-lg cursor-pointer hover:bg-indigo-50 outline-none"
                onSelect={handleDownloadGraphic}
              >
                <Download className="w-4 h-4" />
                Download Share Graphic
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator className="h-px bg-indigo-100 my-1" />
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm font-serif text-red-600 rounded-lg cursor-pointer hover:bg-red-50 outline-none"
              onSelect={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <AlertDialog.Root
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 max-w-md w-[90vw] z-50">
            <AlertDialog.Title className="font-sans text-lg text-indigo-950 mb-2">
              Delete Share
            </AlertDialog.Title>
            <AlertDialog.Description className="font-serif text-indigo-950/70 mb-6">
              Are you sure you want to delete this share? This action cannot be
              undone.
            </AlertDialog.Description>
            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 font-serif text-sm text-indigo-950 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 font-serif text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}

async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
}
