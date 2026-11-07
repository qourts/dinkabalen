# Dinkabalen 2026 — Player Portal

Public, read-only website: **https://qourts.github.io/dinkabalen/**

This repository contains the public-facing schedule, court board, teams, standings, and playoff view. It is **not** the source of truth for score entry.

## Current release

The current `index.html` is the **schedule-only Player Portal**. It contains all 30 teams and 67 scheduled matches, but no official results or publication revision. The website does not receive live scores from the operator laptop automatically.

## Safe publication

The authoritative scoring engine and private release sanitizer live in **`qourts/admin_dinkabalen`**. Publication requires:

1. A validated export from the authoritative offline Admin (not a draft or demo).
2. Running the **private sanitizer** against the canonical master and the currently deployed `index.html`; this strips all operator logic and rejects stale/reused publication revisions.
3. Browser validation of scores, standings, qualification and playoff teams.
4. A reviewed commit of the generated, read-only `index.html` in this repository and successful GitHub Pages deployment.

**Never commit the raw Admin export, an operator-enabled master, browser backups, or administrative secrets here.** A GitHub Pages deploy is a separate step from creating an offline export.

The 20-minute timetable slots are not match time limits. The committee has not yet approved the provisional ranking criteria. High Intermediate player names are awaiting verification.
