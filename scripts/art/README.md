# Avatar / mascot art pipeline (used 2026-10-03 for the Academy companions)
1. node scripts/art/generate-avatar.mjs <name> <prompt.txt> [style-ref.png identity-ref.png]   -> scripts/art/out/<name>.png
   Calls the project's ai-image-generation function (Google image model). Use a finished avatar as the FIRST reference for style, an old image as the SECOND for identity.
   The server's Picsart cut-out is not configured (picsartApplied=false), so step 2 does the transparency.
2. python scripts/art/cutout-avatars.py   -> scripts/art/out/final/<name>.png (512px, true alpha) + out/montage.png preview on white/purple/dark.
3. Save as WebP/PNG under public/ with a NEW file name (the offline cache keeps old image URLs up to 30 days).
