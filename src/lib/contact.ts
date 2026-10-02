/**
 * CONTACT VALIDATION — single source of truth.
 *
 * The same rules run on the client (fast feedback) and again on the
 * server (the only check that actually matters). Client-side checks
 * are a convenience, never a guarantee.
 *
 * No HTML is ever rendered from these values, so this is primarily
 * about bounding input, rejecting obvious payloads and keeping the
 * allowlist of accepted project types closed.
 */

/** Must stay in sync with `contact.form.types` in content.ts. */
export const PROJECT_TYPES = [
  'Software Project',
  'AI / ML Project',
  'Security Work',
  'Collaboration',
  'Other',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 }, // RFC 5321 maximum address length
  message: { min: 10, max: 2000 },
} as const;

/** Hard cap on the serialised request body. */
export const MAX_BODY_BYTES = 16 * 1024;

export interface ContactInput {
  name: string;
  email: string;
  projectType: string;
  message: string;
  /** Honeypot — must be empty. Hidden from real users. */
  company?: string;
}

export type FieldErrors = Partial<
  Record<'name' | 'email' | 'projectType' | 'message', string>
>;

export interface ValidationResult {
  ok: boolean;
  errors: FieldErrors;
  value?: ContactInput;
}

/**
 * Deliberately conservative email check. Over-strict patterns reject
 * valid addresses; the only authoritative verification is a
 * confirmation email, which this endpoint never sends silently.
 */
const EMAIL_RE =
  /^[^\s@,;:<>()[\]\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

/**
 * Characters that become dangerous the moment a value is interpolated
 * into HTML, a URL, a header or a shell command. Belt and braces: React
 * escapes on render, and no value here is ever treated as markup.
 */
const UNSAFE_RE = /[<>{}\[\]\\`$]|javascript:|data:text\/html|\bon\w+\s*=|&#/i;

/**
 * True for ASCII control characters (NUL, DEL, and the C0 range).
 * Tested by code point rather than matched by regex so that no escape
 * sequence — and therefore no raw control byte — is needed here.
 */
function isControl(code: number): boolean {
  return code < 32 || code === 127;
}

/** Only these keys may appear in a submission. */
const ALLOWED_KEYS = new Set(['name', 'email', 'projectType', 'message', 'company']);

function isClean(value: string): boolean {
  return !UNSAFE_RE.test(value);
}

/** Strips control characters; normalises surrounding whitespace. */
function tidy(value: unknown): string {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value) {
    out += isControl(ch.codePointAt(0) ?? 0) ? ' ' : ch;
  }
  return out.trim();
}

export function validateContact(raw: unknown): ValidationResult {
  const errors: FieldErrors = {};

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: { message: 'Invalid submission.' } };
  }

  const input = raw as Record<string, unknown>;

  // Reject unexpected fields outright rather than silently ignoring
  // them — this is what stops a payload smuggling extra keys.
  for (const key of Object.keys(input)) {
    if (!ALLOWED_KEYS.has(key)) {
      return { ok: false, errors: { message: 'Unexpected field in submission.' } };
    }
  }

  const name = tidy(input.name);
  const email = tidy(input.email).toLowerCase();
  const projectType = tidy(input.projectType);
  const message = tidy(input.message);
  const company = tidy(input.company);

  if (name.length < LIMITS.name.min) {
    errors.name = 'Please enter your name.';
  } else if (name.length > LIMITS.name.max) {
    errors.name = `Name must be under ${LIMITS.name.max} characters.`;
  } else if (!isClean(name)) {
    errors.name = 'Name contains unsupported characters.';
  }

  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (email.length > LIMITS.email.max) {
    errors.email = 'That email address is too long.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Closed allowlist — never trust a free-form category.
  if (!PROJECT_TYPES.includes(projectType as ProjectType)) {
    errors.projectType = 'Please choose a valid project type.';
  }

  if (message.length < LIMITS.message.min) {
    errors.message = 'Please add a little more detail.';
  } else if (message.length > LIMITS.message.max) {
    errors.message = `Message must be under ${LIMITS.message.max} characters.`;
  } else if (!isClean(message)) {
    errors.message = 'Message contains unsupported characters.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, errors: {}, value: { name, email, projectType, message, company } };
}

/**
 * Honeypot decision. A real visitor never sees or fills this field;
 * a bot that fills every input does.
 */
export function isBot(value?: ContactInput): boolean {
  return Boolean(value?.company && value.company.length > 0);
}