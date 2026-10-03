#!/usr/bin/env bash
# Vercel "Ignored Build Step" (vercel.json ignoreCommand).
# Exit 0 = skip this build, exit 1 = build it.
#
# Every Vercel deployment keeps a full copy of the site (~0.5 GB with the
# lesson art and voice clips). Building every work branch and every bot
# commit filled 82 GB of deployment storage (Hobby allows 10 GB) and the
# project was paused (2026-10-03). So: only the live site (main) builds, and
# not for commits that change nothing but docs/ (audit reports, song takes).

if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then
  echo "Skip: branch '$VERCEL_GIT_COMMIT_REF' (only main deploys)."
  exit 0
fi

if git rev-parse --verify -q HEAD^ >/dev/null && git diff --quiet HEAD^ HEAD -- . ':(exclude)docs'; then
  echo "Skip: only docs/ changed."
  exit 0
fi

echo "Build."
exit 1
