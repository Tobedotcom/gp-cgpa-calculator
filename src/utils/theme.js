// Light / dark theme helpers.
//
// The active theme lives on <html data-theme="light|dark"> (the CSS variables
// in index.css key off that attribute) and the choice is saved in
// localStorage under "theme". index.html applies the saved value before the
// first paint; keep the key and values there in sync with this file.

const THEME_KEY = "theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    // localStorage can be unavailable (e.g. blocked storage) - use light
    return "light";
  }
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);

  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // The theme still applies for this visit even if it cannot be saved
  }

  return next;
}
