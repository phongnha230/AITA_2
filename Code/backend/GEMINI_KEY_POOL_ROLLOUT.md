# Gemini key pool rollout

The Gemini credential pool is dashboard-first. `GEMINI_API_KEY` and the
comma-separated `GEMINI_API_KEYS` list are emergency fallbacks only and are
never exposed by the admin API.

## Required configuration

Generate a dedicated 32-byte encryption key and store only its base64 value in
the deployment secret manager:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Set `AI_KEY_ENCRYPTION_KEY`, keep `GEMINI_KEY_SOURCE=dashboard-first`, and set
`GEMINI_ENV_KEY_FALLBACK=true` while the emergency env fallback is desired.
Production startup fails when the encryption key is missing or malformed.

## Zero-downtime key migration

1. Apply the Prisma migration while keeping the existing `JWT_SECRET`.
2. Deploy the dual-decrypt code.
3. Run `npm run ai:reencrypt-keys` once.
4. Confirm the command reports every valid version-1 key as migrated. Invalid
   placeholder ciphertext is disabled and reported, never deleted.
5. Verify chatbot generation, RAG indexing, retrieval, and grading using a
   dashboard Gemini key with the env fallback temporarily empty.
6. Rotate `JWT_SECRET` only after no valid version-1 key remains.

The embedding model, 768-dimensional vectors, and
`aita_solution_code_chunks_v2` collection are unchanged, so this rollout does
not require a RAG backfill.
