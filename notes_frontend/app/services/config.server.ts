import { invariant } from "../utils/invariant";

/**
 * Resolve configuration from environment variables.
 * PUBLIC_INTERFACE
 */
export function getConfig() {
  // These must be provided by the environment via .env (see .env.example)
  const NOTES_API_URL = process.env.NOTES_API_URL;
  invariant(
    typeof NOTES_API_URL === "string" && NOTES_API_URL.length > 0,
    "NOTES_API_URL env var is required"
  );
  return { NOTES_API_URL };
}
