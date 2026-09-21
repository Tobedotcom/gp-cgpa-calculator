import "../css/components/AccountPromptModal.css";
import { createRipple } from "../utils/ripple";

function AccountPromptModal({ onCreateAccount, onContinueGuest }) {
  return (
    <div className="account-modal__overlay">
      <div className="account-modal">
        <div className="account-modal__preview">
          <div className="account-modal__preview-header">
            <span>FUTO CGPA & GP CALCULATOR</span>
          </div>

          <div className="account-modal__preview-cgpa">
            <span className="account-modal__preview-label">
              CALCULATED CGPA
            </span>
            <div className="account-modal__preview-cgpa-value">
              <strong>4.62</strong>
              <span>/ 5.00</span>
            </div>
          </div>

          <div className="account-modal__preview-stats">
            <div>
              <span>Units</span>
              <strong>42</strong>
            </div>
            <div>
              <span>Semesters</span>
              <strong>2 of 10</strong>
            </div>
          </div>
        </div>

        <div className="account-modal__content">
          <button
            type="button"
            className="account-modal__close"
            onClick={onContinueGuest}
            aria-label="Close"
          >
            ×
          </button>

          <span className="account-modal__eyebrow">CALCULATION COMPLETE</span>

          <h2>Keep your academic progress</h2>

          <p>
            Your calculation is ready. Create a free account to keep your
            academic records and unlock more features.
          </p>

          <div className="account-modal__benefits">
            <div className="account-modal__benefit">
              <span className="account-modal__benefit-icon">📋</span>
              <div>
                <strong>Save your records</strong>
                <span>Keep your semesters, courses, and CGPA saved.</span>
              </div>
            </div>

            <div className="account-modal__benefit">
              <span className="account-modal__benefit-icon">👤</span>
              <div>
                <strong>Manage your profile</strong>
                <span>
                  Add your name, matric number, faculty, and department.
                </span>
              </div>
            </div>

            <div className="account-modal__benefit">
              <span className="account-modal__benefit-icon">📄</span>
              <div>
                <strong>Export your transcript</strong>
                <span>
                  Generate a PDF transcript from your academic records.
                </span>
              </div>
            </div>
          </div>

          <div className="account-modal__actions">
            <button
              type="button"
              className="account-modal__primary ripple-button"
              onClick={(event) => {
                createRipple(event);
                onCreateAccount();
              }}
            >
              Create an account →
            </button>

            <button
              type="button"
              className="account-modal__secondary ripple-button ripple-button--dark"
              onClick={(event) => {
                createRipple(event);
                onContinueGuest();
              }}
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPromptModal;
