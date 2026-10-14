# RAG v2 rollout

Run these steps against staging first. Never point integration tests or `prisma db push` at the production TiDB database.

1. Deploy the application with `AI_GRADING_REQUIRE_READY_RAG=false`.
2. Run `npx prisma migrate deploy` using the intended deployment database credentials.
3. Configure `GEMINI_GENERATION_MODEL=gemini-3.8-flash`, `GEMINI_EMBEDDING_MODEL=gemini-embedding-001`, Chroma, Redis and Gemini credentials.
4. Run `npm run rag:backfill` once. Keep the RAG indexing worker running until every active solution is `READY` with the current content hash, embedding model and chunker version.
5. Prepare a reviewed golden dataset containing real version metadata, queries and expected Chroma chunk IDs. Set `RAG_GOLDEN_DATASET` and run `npm run rag:evaluate`; rollout is blocked unless Recall@4 is at least `0.80`.
6. Set `AI_GRADING_REQUIRE_READY_RAG=true` and redeploy. AI grading will continue to fail closed if an active solution is stale or not ready.

The v2 collection is `aita_solution_code_chunks_v2`. Do not mix it with embeddings from the legacy collection.
