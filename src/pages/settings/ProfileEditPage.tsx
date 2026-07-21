/** @doc Separate profile editor for name and avatar. */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check } from "lucide-react";
import { toast } from "sonner";
import OliveAvatar from "@/components/branding/OliveAvatar";
import ProfileGlassShell, {
  GlassCard,
  GlassField,
  GlassPrimaryButton,
  GlassSecondaryButton,
} from "@/components/profile/ProfileGlassShell";
import { SubShell, SubSection, SubCard } from "@/components/settings/SubShell";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeErrorMessage } from "@/lib/sanitizeError";
import { useIsMobile } from "@/hooks/use-mobile";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserId(user.id);
      setUserEmail(user.email || "");
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      setAvatarUrl(user.user_metadata?.avatar_url || null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile && !cancelled) {
        if (profile.display_name) setUserName(profile.display_name);
        setAvatarUrl(profile.avatar_url || user.user_metadata?.avatar_url || null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const goBack = () => navigate("/settings");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      await supabase.rpc("update_profile_safe", { p_user_id: userId, p_avatar_url: publicUrl });
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      toast.success("Profile photo updated");
    } catch (err: any) {
      toast.error(sanitizeErrorMessage(err, "Failed to upload photo"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveName = async () => {
    const nextName = userName.trim();
    if (!nextName || !userId) return;
    setSaving(true);
    try {
      await supabase.rpc("update_profile_safe", {
        p_user_id: userId,
        p_display_name: nextName,
      });
      await supabase.auth.updateUser({ data: { full_name: nextName } });
      toast.success("Profile updated");
      navigate("/settings");
    } catch (err: any) {
      toast.error(sanitizeErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const editor = (
    <>
      <style>{profileEditCss}</style>
      <div className="pe-photo-wrap">
        <button
          type="button"
          className={`pe-photo ${uploading ? "is-uploading" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" />
          ) : (
            <OliveAvatar seed={userEmail || userName} className="h-full w-full" />
          )}
          <span className="pe-camera"><Camera className="w-[16px] h-[16px]" /></span>
        </button>
        <p className="pe-photo-hint">{uploading ? "Uploading photo…" : "Tap to change photo"}</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleAvatarUpload}
      />
    </>
  );

  if (isMobile) {
    return (
      <ProfileGlassShell title="Edit Profile" onBack={goBack}>
        <div className="pe-hero">{editor}</div>
        <GlassCard className="pe-field-card">
          <label className="pe-field">
            <span className="pe-field-label">Display name</span>
            <input
              className="pe-input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              placeholder="Your name"
              autoComplete="off"
            />
          </label>
          
        </GlassCard>

        {userEmail && (
          <GlassCard className="pe-field-card">
            <div className="pe-meta">
              <span className="pe-meta-label">Email</span>
              <span className="pe-meta-value">{userEmail}</span>
            </div>
          </GlassCard>
        )}

        <div className="pe-actionbar">
          <GlassSecondaryButton onClick={goBack} className="pe-btn">Cancel</GlassSecondaryButton>
          <GlassPrimaryButton onClick={handleSaveName} disabled={saving || !userName.trim()} className="pe-btn">
            {saving ? "Saving…" : <><Check className="w-4 h-4" /> Save changes</>}
          </GlassPrimaryButton>
        </div>
      </ProfileGlassShell>
    );
  }


  return (
    <SubShell title="Edit Profile" subtitle="Update your display name and profile photo." backTo="/settings">
      <SubSection title="Photo" description="Upload a clear profile image.">
        <SubCard>{editor}</SubCard>
      </SubSection>
      <SubSection title="Name" description="Choose how your name appears in Megsy.">
        <SubCard>
          <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80 font-medium">
            Display name
          </label>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="mt-2 w-full px-3.5 py-2.5 rounded-lg bg-background/60 border border-border/70 text-[14px] text-foreground outline-none focus:border-foreground/40 transition-colors"
          />
          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={goBack} className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveName} disabled={saving || !userName.trim()} className="px-4 py-2 rounded-lg text-[13px] font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </SubCard>
      </SubSection>
    </SubShell>
  );
};

const profileEditCss = `
.pe-hero {
  display: flex; justify-content: center;
  padding: 8px 0 24px;
}
.pe-photo-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.pe-photo {
  position: relative;
  width: 132px; height: 132px;
  border: 0; padding: 0;
  border-radius: 50%;
  overflow: visible;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.22,1,0.36,1);
}
.pe-photo::after {
  content: "";
  position: absolute; inset: -6px;
  border-radius: 50%;
  background:
    conic-gradient(from 210deg, rgba(255,255,255,0.55), var(--overlay-white-05) 30%, rgba(255,255,255,0.35) 60%, var(--overlay-white-05) 85%, rgba(255,255,255,0.55));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px));
  pointer-events: none;
  opacity: 0.75;
}
.pe-photo > img,
.pe-photo > svg {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  box-shadow: 0 24px 44px -22px rgba(0,0,0,0.6);
}
.pe-photo:active { transform: scale(0.97); }
.pe-photo:disabled { opacity: 0.7; }
.pe-photo.is-uploading { animation: pe-pulse 0.9s ease-in-out infinite alternate; }
.pe-camera {
  position: absolute; right: 2px; bottom: 4px;
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,0.16);
  backdrop-filter: blur(14px);
  color: #fff;
  display: grid; place-items: center;
  box-shadow: 0 8px 22px -8px var(--overlay-black-55),
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 0 0 1.5px rgba(10,10,10,0.6);
}
.pe-photo-hint {
  margin: 0;
  font-size: 12.5px;
  color: var(--overlay-white-60);
  letter-spacing: 0.01em;
}

.pe-field-card { padding: 16px 18px; }
.pe-field { display: flex; flex-direction: column; gap: 6px; }
.pe-field-label {
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.pe-input {
  width: 100%;
  background: var(--overlay-white-06);
  border: 1px solid var(--overlay-white-10);
  border-radius: 14px;
  outline: none;
  padding: 14px 16px;
  color: #fff;
  font: inherit;
  font-size: 16px; font-weight: 500;
  letter-spacing: -0.005em;
  box-shadow: inset 0 1px 0 var(--overlay-white-06);
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}
.pe-input:focus {
  border-color: rgba(255,255,255,0.35);
  background: var(--overlay-white-10);
  box-shadow: inset 0 1px 0 var(--overlay-white-10), 0 0 0 3px var(--overlay-white-06);
}
.pe-input::placeholder { color: rgba(255,255,255,0.35); }
.pe-field-hint {
  margin: 10px 0 0;
  font-size: 12.5px; line-height: 1.5;
  color: rgba(255,255,255,0.5);
}

.pe-meta {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.pe-meta-label {
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.14em; text-transform: uppercase;
}
.pe-meta-value {
  font-size: 14px; color: var(--overlay-white-90);
  max-width: 60%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.pe-actionbar {
  display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px;
  margin-top: 8px;
}
.pe-btn { width: 100%; gap: 7px; }

@keyframes pe-pulse {
  from { transform: scale(0.98); }
  to { transform: scale(1); }
}
`;


export default ProfileEditPage;