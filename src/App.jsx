
import { useEffect, useState } from "react";

import { supabase } from "./lib/supabase";

import Header from "./components/Header";
import EmailVerification from "./components/EmailVerification";
import AcademicStatus from "./components/AcademicStatus";
import CGPASummary from "./components/CGPASummary";
import AcademicRecord from "./components/AcademicRecord";
import TranscriptPreview from "./components/TranscriptPreview";

import AccountPromptModal from "./components/AccountPromptModal";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import AIChat from "./components/AIChat";

function App() {
  // ===== State =====

  const [user, setUser] = useState(null);
  const [overallCGPA, setOverallCGPA] = useState(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [verificationEmail, setVerificationEmail] = useState("");

  const [showProfile, setShowProfile] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(0);

  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  const [showTranscript, setShowTranscript] = useState(false);

  const [profile, setProfile] = useState(null);

  const [transcriptData, setTranscriptData] = useState(null);

  // ===== Effects =====
  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
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

  function handleGuestSecondCourse() {
    if (user) return;

    const hasShownPrompt = sessionStorage.getItem("cgpa-account-prompt-shown");

    if (hasShownPrompt) return;

    setShowAccountPrompt(true);
    sessionStorage.setItem("cgpa-account-prompt-shown", "true");
  }

  // ===== Render =====

  return (
    <div className="app">
      <Header
        user={user}
        onLogin={() => {
          setAuthMode("login");
          setShowAuth(true);
        }}
        onEditProfile={() => setShowProfile(true)}
        onExportTranscript={() => setShowTranscript(true)}
        profileUpdated={profileUpdated}
        hasAcademicData={typeof overallCGPA === "number"}
        onLogout={() => {
          setUser(null);
          setShowProfile(false);
          setTranscriptData(null);
        }}
      />

      {transcriptData && (
        <TranscriptPreview
          data={transcriptData}
          profile={profile}
          onClose={() => setTranscriptData(null)}
        />
      )}
      {showAuth ? (
        <main className="auth-page">
          {authMode === "login" ? (
            <Login
              onSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                setShowAuth(false);
              }}
              onSwitchToSignup={() => {
                setAuthMode("signup");
              }}
            />
          ) : authMode === "signup" ? (
            <Signup
              onSuccess={(signedUpUser) => {
                setUser(signedUpUser);
                setShowAuth(false);
              }}
              onSwitchToLogin={() => {
                setAuthMode("login");
              }}
              onVerificationRequired={(email) => {
                setVerificationEmail(email);
                setAuthMode("verification");
              }}
            />
          ) : (
            <EmailVerification
              email={verificationEmail}
              onBackToLogin={() => {
                setVerificationEmail("");
                setAuthMode("login");
              }}
            />
          )}
        </main>
      ) : (
        <main className="main-content">
          <AcademicStatus />

          <CGPASummary overallCGPA={overallCGPA} />

          <AcademicRecord
            user={user}
            onOverallCGPAChange={setOverallCGPA}
            onGuestSecondCourse={handleGuestSecondCourse}
            isTranscriptOpen={showTranscript}
            onCloseTranscript={() => setShowTranscript(false)}
            onTranscriptContinue={(selected) => {
              setTranscriptData(selected);
              setShowTranscript(false);
            }}
          />
        </main>
      )}

      {!showAuth && <AIChat />}

      {showAccountPrompt && (
        <AccountPromptModal
          onCreateAccount={() => {
            setShowAccountPrompt(false);
            setAuthMode("signup");
            setShowAuth(true);
          }}
          onContinueGuest={() => {
            setShowAccountPrompt(false);
          }}
        />
      )}

      {showProfile && (
        <div className="profile-modal">
          <div className="profile-modal__content">
            <button
              type="button"
              className="profile-modal__close"
              onClick={() => setShowProfile(false)}
              aria-label="Close profile"
            >
              ×
            </button>

            <Profile
              onProfileUpdated={() => {
                setProfileUpdated((current) => current + 1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
