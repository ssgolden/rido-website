/**
 * Waitlist email rule, shared by the forms and the Next route. The Netlify
 * Function (netlify/functions/waitlist.mjs) keeps an identical copy: keep the
 * two in sync so the form never accepts an address the server rejects.
 * The first character may not be "/" (Netlify Blobs keys cannot start with it).
 */
export const EMAIL_RE = /^[^\s@/][^\s@]{0,63}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export const isValidEmail = (email: string): boolean => email.length <= 254 && EMAIL_RE.test(email.trim().toLowerCase());
