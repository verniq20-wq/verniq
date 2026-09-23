/**
 * Service configuration.
 *
 * While `DEMO_MODE` is true, every service returns sample data from
 * `src/data/demo.ts` after a short, realistic delay. No AI model, speech
 * engine or server is contacted. To connect a real backend, set
 * `VITE_VERNIQ_API_URL` and replace the body of each service function with
 * an API call — the function signatures are the contract the UI relies on.
 */
export const API_URL: string | undefined = import.meta.env.VITE_VERNIQ_API_URL;

export const DEMO_MODE = !API_URL;

/** Base delay for simulated work, kept short so the UI stays snappy. */
export const DEMO_LATENCY_MS = 650;
