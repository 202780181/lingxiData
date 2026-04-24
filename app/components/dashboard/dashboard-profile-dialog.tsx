import * as React from "react";
import { Camera } from "lucide-react";

import { AppDialog, AppDialogCloseButton } from "@/components/ui/app-dialog";
import { cn } from "@/lib/utils";

export interface DashboardProfileDialogUser {
  name: string;
  email: string;
  username: string;
  initials: string;
  avatarUrl?: string | null;
}

interface DashboardProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: DashboardProfileDialogUser;
  onSave: (nextProfile: {
    name: string;
    username: string;
    avatarUrl: string | null;
  }) => void;
}

export function DashboardProfileDialog({
  open,
  onClose,
  profile,
  onSave,
}: DashboardProfileDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [draftName, setDraftName] = React.useState(profile.name);
  const [draftUsername, setDraftUsername] = React.useState(profile.username);
  const [draftAvatarUrl, setDraftAvatarUrl] = React.useState<string | null>(
    profile.avatarUrl ?? null,
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setDraftName(profile.name);
    setDraftUsername(profile.username);
    setDraftAvatarUrl(profile.avatarUrl ?? null);
  }, [open, profile]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const normalizedName = draftName.trim();
  const normalizedUsername = draftUsername.trim();
  const canSave = normalizedName.length > 0 && normalizedUsername.length > 0;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      labelledBy="dashboard-profile-dialog-title"
      size="account"
    >
      <div className="w-full max-h-[calc(100svh-24px)] overflow-y-auto px-5 pb-5 pt-4 md:px-5 md:pb-5 md:pt-4">
        <div className="flex items-start justify-between gap-4">
          <h2 id="dashboard-profile-dialog-title" className="app-dialog-title">
            编辑个人资料
          </h2>

          <AppDialogCloseButton onClick={onClose} />
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div className="relative">
            <div className="grid size-[176px] place-items-center rounded-full border-[4px] border-[#1364db] bg-[#27bea5] text-[48px] font-medium text-white shadow-[inset_0_0_0_6px_white] dark:shadow-[inset_0_0_0_6px_#17181c]">
              {draftAvatarUrl ? (
                <img
                  src={draftAvatarUrl}
                  alt="用户头像"
                  className="size-full rounded-full object-cover"
                />
              ) : (
                getPreviewInitials(
                  normalizedName || profile.name || profile.email,
                )
              )}
            </div>

            <button
              type="button"
              aria-label="上传头像"
              className="absolute right-0.5 bottom-3.5 grid size-[46px] place-items-center rounded-full border border-[var(--app-dialog-border-strong)] bg-[var(--app-dialog-control-surface)] text-[var(--app-dialog-body)] shadow-[0_8px_18px_rgba(15,23,42,0.08)] outline-none transition-colors hover:bg-[var(--app-dialog-button-hover)] focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/12"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-5" strokeWidth={1.9} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];

                if (!selectedFile) {
                  return;
                }

                const reader = new FileReader();

                reader.onload = () => {
                  setDraftAvatarUrl(
                    typeof reader.result === "string" ? reader.result : null,
                  );
                };

                reader.readAsDataURL(selectedFile);
                event.currentTarget.value = "";
              }}
            />
          </div>
        </div>

        <form
          className="mt-7 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSave) {
              return;
            }

            onSave({
              name: normalizedName,
              username: normalizedUsername,
              avatarUrl: draftAvatarUrl,
            });
            onClose();
          }}
        >
          <ProfileField
            label="显示名称"
            value={draftName}
            onChange={setDraftName}
            autoComplete="name"
          />

          <ProfileField
            label="用户名"
            value={draftUsername}
            onChange={setDraftUsername}
            autoComplete="username"
          />

          <p className="app-dialog-note mx-auto max-w-[760px] px-3 text-center">
            个人资料有助于他人识别你的身份。你的姓名和用户名也将用于系统内的公开展示。
          </p>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              className="app-dialog-button app-dialog-button--secondary px-6"
              onClick={onClose}
            >
              取消
            </button>

            <button
              type="submit"
              disabled={!canSave}
              className={cn(
                "app-dialog-button px-6",
                canSave
                  ? "app-dialog-button--primary"
                  : "cursor-not-allowed bg-[#c7c7c7] text-white/90 dark:bg-white/20 dark:text-white/60",
              )}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </AppDialog>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="app-dialog-field">
      <span className="app-dialog-field-label">{label}</span>
      <input
        type="text"
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-dialog-input"
      />
    </label>
  );
}

function getPreviewInitials(value: string) {
  const compactValue = value.trim();

  if (!compactValue) {
    return "AA";
  }

  return compactValue.slice(0, 2).toUpperCase();
}
