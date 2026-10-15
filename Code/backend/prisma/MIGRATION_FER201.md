# FER201 migration rollout

Fresh databases run both migrations normally with `npx prisma migrate deploy`.

For an existing database that already contains `teams`, `team_members`, `git_contributors`, or `submissions.team_id`, mark only the baseline as applied after verifying those objects, then deploy the delta:

```bash
npx prisma migrate resolve --applied 20261015130000_team_grading_baseline
npx prisma migrate deploy
```

Back up the database and check duplicate attempt/team Git identity data before creating the new unique indexes.
