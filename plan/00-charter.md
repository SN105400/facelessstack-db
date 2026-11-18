# Planning Charter — Zero-Capital Income Projects (Week 0)

**Goal:** identify and validate a project that generates money for a solo developer with **zero capital outlay**, powered by a nightly fleet of free GLM-5.3-Flash tokens.

## Hard constraints
- **Capital: $0.** No paid hosting, domains (use free/cheap existing), paid APIs, or ads. Free tiers only (e.g., GitHub Pages, Cloudflare Pages/Workers free, Vercel Hobby, Gumroad/Etsy marketplaces with no upfront cost).
- **Engine:** ~300M free tokens/night (weekday), ~500M (weekend). Tokens expire daily at 09:00 local (UTC+8) — the project must *productively absorb* the budget every night. 3-request concurrency cap (weekday work = deep/sequential; weekend = parallel fan-out).
- **Operator:** one developer (user) + agent fleet. Human owns architecture and review; agents implement, research, and produce.
- **Model quality:** GLM-5.3-Flash — strong implementation/production horsepower; weak for frontier reasoning. Design around it (template-driven production, human-reviewed architecture).

## Decision protocol
1. **Sprint 1 (today):** four senior-expert personas research independently → candidate list with $0-verification, first-dollar path, risks.
2. **Synthesis:** scoring matrix → shortlist of 3 → direction docs with **kill criteria**.
3. **User picks one** → 6-week ROADMAP.
4. **Nightly:** the automation executes ROADMAP work; every night produces a committed artifact (content, code, data).
5. **Sunday (500M):** retrospective + replan. Kill criteria evaluated honestly.

## Output convention
All planning artifacts live in `plan/`:
- `00-charter.md` — this file
- `sprint1-<persona>.md` — persona reports
- `direction-shortlist.md` — synthesis, scoring, recommendation
- `NIGHTLY-TASK.md` — self-contained spec for the recurring nightly automation (runs in a new chat)
