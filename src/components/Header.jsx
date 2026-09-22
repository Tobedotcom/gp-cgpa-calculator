import { useEffect, useState } from "react";

import futoLogo from "../assets/logo.jfif";

import "../css/components/Header.css";

import { supabase } from "../lib/supabase";

import { createRipple } from "../utils/ripple";

import { applyTheme, getCurrentTheme } from "../utils/theme";

import OnboardingHint from "./OnboardingHint";

// Per-user, per-hint key so each onboarding hint is remembered
// independently for each account that logs in on this browser/device.
const ONBOARDING_HINT_KEY_PREFIX = "cgpa-onboarding-hint-dismissed:";

function isHintDismissed(hintId, userId) {
  try {
    return (
      localStorage.getItem(`${ONBOARDING_HINT_KEY_PREFIX}${hintId}:${userId}`) ===
      "true"
    );
  } catch {
    // localStorage can be unavailable (e.g. blocked storage) - treat the
    // hint as already seen rather than risk showing it on every visit.
    return true;
  }
}

function markHintDismissed(hintId, userId) {
  try {
    localStorage.setItem(
      `${ONBOARDING_HINT_KEY_PREFIX}${hintId}:${userId}`,
      "true"
    );
  } catch {
    // Storage may be unavailable; the hint will simply show again later.
  }
}

function Header({
  user,
  onEditProfile,
  onExportTranscript,
  profileUpdated,
  onLogout,
  onLogin,
  hasAcademicData,
}) {
  const [profile, setProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [theme, setTheme] = useState(getCurrentTheme);
  const [showProfileHint, setShowProfileHint] = useState(false);
  const [showTranscriptHint, setShowTranscriptHint] = useState(false);

  const isDark = theme === "dark";

  function toggleTheme() {
    setTheme(applyTheme(isDark ? "light" : "dark"));
  }

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsProfileOpen(false);
      setShowLogoutConfirm(false);
      return;
    }

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, matric_number, faculty, department")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      setProfile(data);
    }

    loadProfile();
  }, [user, profileUpdated]);

  // Show the "complete your profile" hint the first time this user reaches
  // the app, until they dismiss it. Guests never see it.
  useEffect(() => {
    if (!user) {
      setShowProfileHint(false);
      return;
    }

    setShowProfileHint(!isHintDismissed("profile", user.id));
  }, [user]);

  // Show the "export your transcript" hint once it's actually relevant:
  // the user is signed in and has academic results worth exporting. It
  // reacts to eligibility rather than latching permanently, so it hides
  // again if there's nothing to export yet and reappears once there is -
  // unless the user already dismissed it.
  useEffect(() => {
    if (!user || !hasAcademicData) {
      setShowTranscriptHint(false);
      return;
    }

    setShowTranscriptHint(!isHintDismissed("export-transcript", user.id));
  }, [user, hasAcademicData]);

  function dismissProfileHint() {
    setShowProfileHint(false);

    if (!user) return;

    markHintDismissed("profile", user.id);
  }

  function dismissTranscriptHint() {
    setShowTranscriptHint(false);

    if (!user) return;

    markHintDismissed("export-transcript", user.id);
  }

  const firstLetter =
    profile?.full_name?.trim()?.charAt(0)?.toUpperCase() || "F";

  function handleLogoutClick(event) {
    createRipple(event);
    setShowLogoutConfirm(true);
    setIsProfileOpen(false);
  }

  async function confirmLogout(event) {
    createRipple(event);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error);
      return;
    }

    setShowLogoutConfirm(false);
    setIsProfileOpen(false);

    if (onLogout) {
      onLogout();
    }
  }

  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">
          <img src={futoLogo} alt="FUTO logo" />
        </div>

        <div className="header__brand-info">
          <div className="header__brand-name">GP & CGPA</div>

          <div className="header__brand-subtitle">Academic Degree Tracker</div>
        </div>
      </div>

      <div className="header__actions">
        <button
          type="button"
          className="header__theme"
          onClick={toggleTheme}
          aria-label={
            isDark
              ? "Dark mode is on. Switch to light mode"
              : "Light mode is on. Switch to dark mode"
          }
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <svg
            className="header__theme-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isDark ? (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </>
            )}
          </svg>

          <span className="header__theme-label">
            {isDark ? "Dark" : "Light"}
          </span>
        </button>

        {!user && (
          <button
            type="button"
            className="header__login ripple-button"
            onClick={(event) => {
              createRipple(event);
              onLogin?.();
            }}
          >
            {" "}
            Login{" "}
          </button>
        )}
        {user && (
          <div className="header__profile-anchor">
            <button
              type="button"
              className="header__profile"
              onClick={() => setIsProfileOpen((current) => !current)}
            >
              <div className="header__avatar">{firstLetter}</div>

              <div className="header__profile-name">
                {profile?.full_name || "FUTO Student"}
              </div>
            </button>

            {showProfileHint && !isProfileOpen && (
              <OnboardingHint
                title="Complete your profile"
                message="Add your name, matric number, faculty and department here."
                onDismiss={dismissProfileHint}
              />
            )}
          </div>
        )}

        {user && isProfileOpen && (
          <div className="header__profile-menu">
            <div className="header__profile-menu-header">
              <strong>{profile?.full_name || "FUTO Student"}</strong>

              <span>{profile?.matric_number || "No matric number"}</span>
            </div>

            <div className="header__profile-details">
              <div>
                <span>Faculty</span>
                <strong>{profile?.faculty || "—"}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>{profile?.department || "—"}</strong>
              </div>
            </div>

            <button
              type="button"
              className="header__profile-edit ripple-button"
              onClick={(event) => {
                createRipple(event);
                setIsProfileOpen(false);
                onEditProfile();
              }}
            >
              Edit Profile
            </button>

            <button
              type="button"
              className="header__profile-logout ripple-button"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </div>
        )}

        {user && (
          <div className="header__export-anchor">
            <button
              type="button"
              className="header__export"
              onClick={onExportTranscript}
            >
              Export Transcript
            </button>

            {showTranscriptHint && !isProfileOpen && (
              <OnboardingHint
                title="Export your transcript"
                message="Tap here to generate a PDF transcript of your academic results."
                onDismiss={dismissTranscriptHint}
              />
            )}
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="header__logout-backdrop">
          <div className="header__logout-modal">
            <h3>Log out?</h3>

            <p>Are you sure you want to log out of your account?</p>

            <div className="header__logout-actions">
              <button
                type="button"
                className="header__logout-cancel ripple-button"
                onClick={(event) => {
                  createRipple(event);
                  setShowLogoutConfirm(false);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="header__logout-confirm ripple-button"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
