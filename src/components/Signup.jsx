import { useState } from "react";
import { supabase } from "../lib/supabase";

import "../css/components/Auth.css";
import { createRipple } from "../utils/ripple";

function Signup({ onSuccess, onSwitchToLogin, onVerificationRequired }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    /*
      Supabase may require email confirmation before
      the user gets an active session.

      If a session exists immediately, we can notify
      the parent component that signup succeeded.
    */
    if (data.session && data.user) {
      if (onSuccess) {
        onSuccess(data.user);
      }

      return;
    }

   if (onVerificationRequired) {
  onVerificationRequired(email);
}
  }

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <span className="auth-card__eyebrow">GET STARTED</span>

        <h1 className="auth-card__title">Create your account</h1>

        <p className="auth-card__description">
          Save your academic records and keep track of your CGPA across
          semesters.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSignup}>
        {errorMessage && (
          <div className="auth-message auth-message--error" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="auth-message auth-message--success" role="status">
            {successMessage}
          </div>
        )}

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="signup-email">
            Email
          </label>

          <input
            className="auth-field__input"
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <div className="auth-field__label-row">
            <label className="auth-field__label" htmlFor="signup-password">
              Password
            </label>

            <button
              type="button"
              className="auth-field__password-toggle"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input
            className="auth-field__input"
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />

          <p className="auth-field__hint">Use at least 6 characters.</p>
        </div>

        <div className="auth-field">
          <div className="auth-field__label-row">
            <label
              className="auth-field__label"
              htmlFor="signup-confirm-password"
            >
              Confirm password
            </label>

            <button
              type="button"
              className="auth-field__password-toggle"
              onClick={() => setShowConfirmPassword((current) => !current)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input
            className="auth-field__input"
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter your password again"
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-form__submit ripple-button"
          onClick={(event) => createRipple(event)}
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="auth-card__footer">
        <p>
          Already have an account?{" "}
          <button
            type="button"
            className="auth-card__switch ripple-button ripple-button--dark"
            onClick={(e) => {
              createRipple(e);
              onSwitchToLogin();
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
