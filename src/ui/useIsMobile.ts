/**
 * Whether this is a phone/tablet, settled once at startup.
 *
 * The stance is the sibling app's: this is a desktop tool, so the decision is
 * about the *device*, not the viewport, a narrow laptop window is still a
 * laptop and gets the full app. We weight the user-agent, then fall back to the
 * coarse-pointer + touch + narrow combination that catches iPadOS (which
 * masquerades as a Mac). Deliberately not reactive to resize: a member who
 * started on a desktop shouldn't be ejected mid-session by rotating a window.
 */
import { useState } from 'react';

function detectMobile(): boolean {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Silk/i.test(ua);

  const canMatch = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const coarse = canMatch && window.matchMedia('(pointer: coarse)').matches;
  const narrow = canMatch && window.matchMedia('(max-width: 820px)').matches;
  const touch = (navigator.maxTouchPoints || 0) > 1;

  // iPadOS reports a Mac UA; the coarse-pointer + multi-touch + narrow trio
  // is what distinguishes it (and other touch tablets) from a real desktop.
  return uaMobile || (coarse && touch && narrow);
}

export function useIsMobile(): boolean {
  const [isMobile] = useState(detectMobile);
  return isMobile;
}
