import assert from "node:assert/strict";
import test from "node:test";
import {
  initializeInvitationLanding,
  invitationLandingState,
  invitationTokenFromFragment,
} from "./invite.mjs";

const token = `Ab_9-${"x".repeat(38)}`;

test("reads a valid token only from the URL fragment", () => {
  assert.equal(invitationTokenFromFragment(`#token=${token}`), token);
  assert.equal(invitationTokenFromFragment(""), null);
  assert.equal(invitationTokenFromFragment("#source=email"), null);
});

test("rejects malformed and out-of-range tokens", () => {
  for (const value of ["short", "x".repeat(31), "x".repeat(129), `${"x".repeat(31)}!`]) {
    assert.equal(invitationTokenFromFragment(`#token=${encodeURIComponent(value)}`), null);
  }
});

test("ignores query strings when no fragment is provided", () => {
  assert.deepEqual(
    invitationLandingState(""),
    { valid: false, deepLink: null },
  );
});

test("builds the custom-scheme link from an encoded fragment value", () => {
  assert.deepEqual(
    invitationLandingState(`#source=email&token=${encodeURIComponent(token)}`),
    {
      valid: true,
      deepLink: `reptilog://pet-sitter-invite#token=${encodeURIComponent(token)}`,
    },
  );
});

test("keeps the button visible and attempts to open the app exactly once", () => {
  const openButton = fakeElement();
  const invalidMessage = fakeElement();
  const scheduled = [];
  const navigations = [];

  initializeInvitationLanding({
    fragment: `#token=${token}`,
    openButton,
    invalidMessage,
    schedule: (callback, delay) => scheduled.push({ callback, delay }),
    navigate: (url) => navigations.push(url),
  });

  assert.equal(openButton.hidden, false);
  assert.equal(invalidMessage.hidden, true);
  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0].delay, 350);
  scheduled[0].callback();
  assert.deepEqual(navigations, [`reptilog://pet-sitter-invite#token=${token}`]);
});

test("shows a safe incomplete-link state without an automatic redirect", () => {
  const openButton = fakeElement();
  const invalidMessage = fakeElement();
  let scheduled = false;
  initializeInvitationLanding({
    fragment: "#token=bad!",
    openButton,
    invalidMessage,
    schedule: () => { scheduled = true; },
  });
  assert.equal(openButton.hidden, true);
  assert.equal(openButton.href, undefined);
  assert.equal(invalidMessage.hidden, false);
  assert.equal(scheduled, false);
});

function fakeElement() {
  return {
    hidden: true,
    removeAttribute(name) {
      if (name === "href") delete this.href;
    },
  };
}
