import { useEffect, useState } from "react";

import futoLogo from "../assets/logo.jfif";

import "../css/components/Header.css";

import { supabase } from "../lib/supabase";

import { createRipple } from "../utils/ripple";

import { applyTheme, getCurrentTheme } from "../utils/theme";

function Header({
  user,
  onEditProfile,
  onExportTranscript,
  profileUpdated,
  onLogout,
  onLogin,
}) {
  const [profile, setProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [theme, setTheme] = useState(getCurrentTheme);

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
          <button
            type="button"
            className="header__export"
            onClick={onExportTranscript}
          >
            Export Transcript
          </button>
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
