import "../css/components/Auth.css";

function EmailVerification({ email, onBackToLogin }) {
  return (
    <div className="auth-card">
      <div className="auth-card__content">
        <span className="auth-card__eyebrow">CHECK YOUR EMAIL</span>

        <h1>Verify your email</h1>

        <p className="auth-card__description">
          We've sent a confirmation link to:
        </p>

        <p className="auth-card__email">{email}</p>

        <p className="auth-card__description">
          Click the link in your email to verify your account and finish signing
          up.
        </p>

        <div className="auth-card__notice">
          <span className="auth-card__notice-icon">✓</span>

          <p>
            Once you've confirmed your email, return here and log in to your
            account.
          </p>
        </div>

        <button
          type="button"
          className="auth-form__submit"
          onClick={onBackToLogin}
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

export default EmailVerification;
