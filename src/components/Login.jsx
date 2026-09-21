import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../css/components/Auth.css";
import { createRipple } from "../utils/ripple";

function Login({ onSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Login successful!");

    if (onSuccess && data.user) {
      onSuccess(data.user);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <span className="auth-card__eyebrow">WELCOME BACK</span>

        <h1 className="auth-card__title">Log in to your account</h1>

        <p className="auth-card__description">
          Access your saved academic records and CGPA history.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
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
          <label className="auth-field__label" htmlFor="login-email">
            Email
          </label>

          <input
            className="auth-field__input"
            id="login-email"
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
            <label className="auth-field__label" htmlFor="login-password">
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
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-form__submit ripple-button"
         onClick={(event) => createRipple(event)}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="auth-card__footer">
        <p>
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-card__switch ripple-button ripple-button--dark"
            onClick={(e) => { createRipple(e); onSwitchToSignup(); }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;