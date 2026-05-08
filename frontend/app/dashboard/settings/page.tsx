"use client";

import { useState, type FormEvent } from "react";
import { User, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  /* ─── Profile form ─── */
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      await api.put("/users/me", { name, phone });
      await refreshUser();
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      if (err instanceof AxiosError) {
        setProfileMsg(err.response?.data?.error ?? "Update failed.");
      } else {
        setProfileMsg("Something went wrong.");
      }
    } finally {
      setProfileSaving(false);
    }
  }

  /* ─── Password form ─── */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwSuccess(false);

    if (newPw.length < 8) {
      setPwMsg("Password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg("Passwords do not match.");
      return;
    }

    setPwSaving(true);
    try {
      await api.put("/users/me/password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwSuccess(true);
      setPwMsg("Password changed successfully.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      if (err instanceof AxiosError) {
        setPwMsg(err.response?.data?.error ?? "Change failed.");
      } else {
        setPwMsg("Something went wrong.");
      }
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Settings
        </p>
        <h1 className="font-display text-4xl leading-tight">Your profile.</h1>
      </div>

      {/* ─── Profile Section ─── */}
      <div className="rounded-2xl bg-(--fg)/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-4 w-4 text-(--muted)" />
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
            Personal Information
          </h2>
        </div>

        <form
          onSubmit={handleProfileSave}
          className="flex flex-col gap-5 max-w-lg"
        >
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Email
            </span>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none opacity-50 cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Full Name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Phone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </label>

          {profileMsg && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                profileMsg.includes("success")
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-red-500/10 text-red-600"
              }`}
            >
              {profileMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {profileSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* ─── Password Section ─── */}
      <div className="rounded-2xl bg-(--fg)/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-4 w-4 text-(--muted)" />
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
            Change Password
          </h2>
        </div>

        <form
          onSubmit={handlePasswordChange}
          className="flex flex-col gap-5 max-w-lg"
        >
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Current Password
            </span>
            <input
              type="password"
              required
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="current-password"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              New Password
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 8 characters"
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="new-password"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Confirm New Password
            </span>
            <input
              type="password"
              required
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="new-password"
            />
          </label>

          {pwMsg && (
            <div
              className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
                pwSuccess
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-red-500/10 text-red-600"
              }`}
            >
              {pwSuccess && <CheckCircle className="h-4 w-4" />}
              {pwMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="self-start rounded-full bg-(--fg)/5 px-7 py-3 text-sm hover:bg-(--fg)/8 transition-colors cursor-pointer disabled:opacity-50"
          >
            {pwSaving ? "Changing…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
