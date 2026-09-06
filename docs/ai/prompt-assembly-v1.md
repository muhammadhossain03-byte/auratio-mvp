# Auratio AI Prompt Assembly v1.0

For each AI evaluation, server-side code constructs exactly one request:

1. **System instruction** — `system-prompt-v1.md`.
2. **Runtime identity** — submission_id, selected track_slug, measured video duration seconds/mm:ss, prompt_version, rubric_version, schema_version.
3. **Source** — the original submitted video only.
4. **Rubric payload** — 8 Universal + 4 Structural + exactly 4 selected-track criteria from `rubrics-and-anchors-v1.json`.
5. **Output contract** — `evaluation-output-schema-v1.json` with JSON-only response enforcement.

Do not send the other 12 track modules. Do not send speaker identity/history. Do not send a transcript. Do not send API keys in the request body.

The server validates the returned JSON before any publication effect. A valid usable result auto-approves; failure/unassessable becomes Rejected. There is no retry.
