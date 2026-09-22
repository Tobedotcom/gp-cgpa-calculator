import "../css/components/OnboardingHint.css";

// Small first-time onboarding bubble anchored under a header control
// (profile/avatar, export transcript, ...). Purely presentational - the
// caller owns when it should be shown, its copy, and what happens when
// it's dismissed, so the same bubble can point at different controls.
function OnboardingHint({ title, message, onDismiss }) {
  return (
    <div className="onboarding-hint" role="dialog" aria-live="polite">
      <button
        type="button"
        className="onboarding-hint__close"
        onClick={onDismiss}
        aria-label="Dismiss hint"
      >
        ×
      </button>

      <strong className="onboarding-hint__title">{title}</strong>

      <p className="onboarding-hint__message">{message}</p>
    </div>
  );
}

export default OnboardingHint;
