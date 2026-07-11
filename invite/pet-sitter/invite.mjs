export const PET_SITTER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

export function invitationTokenFromFragment(fragment) {
  if (typeof fragment !== "string" || fragment.length === 0) return null;
  const value = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  const token = new URLSearchParams(value).get("token")?.trim() ?? "";
  return PET_SITTER_TOKEN_PATTERN.test(token) ? token : null;
}

export function invitationLandingState(fragment) {
  const token = invitationTokenFromFragment(fragment);
  return token
    ? {
      valid: true,
      deepLink: `reptilog://pet-sitter-invite#token=${encodeURIComponent(token)}`,
    }
    : { valid: false, deepLink: null };
}

export function initializeInvitationLanding({
  fragment,
  openButton,
  invalidMessage,
  schedule = globalThis.setTimeout,
  navigate = (url) => globalThis.location.assign(url),
}) {
  const state = invitationLandingState(fragment);
  if (!state.valid) {
    openButton.hidden = true;
    openButton.removeAttribute("href");
    invalidMessage.hidden = false;
    return state;
  }

  openButton.href = state.deepLink;
  openButton.hidden = false;
  invalidMessage.hidden = true;
  schedule(() => navigate(state.deepLink), 350);
  return state;
}

if (typeof document !== "undefined") {
  initializeInvitationLanding({
    fragment: globalThis.location.hash,
    openButton: document.getElementById("open-app"),
    invalidMessage: document.getElementById("invalid-invitation"),
  });
}
