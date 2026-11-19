# Skit script schema — `studio/scripts/<name>.json`

A skit is **declarative data, not code**. The fleet writes these; `scripts/validate_skit.py` gates them;
`scripts/build_skit_audio.py <name>` builds audio; `studio/skit_template.html?name=<name>&encode=1` renders + encodes;
`studio/storyboard.html?name=<name>` shows the human-review storyboard.

```json
{
  "title": "Human-readable title",
  "duration": 14.4,          // seconds — beats/captions must cover it
  "fps": 24,
  "deadpan": { "from": 9.7 }, // optional: switch stickman eyes to flat-line from this time
  "lines": [                  // voice lines; audio builder TTS's each and mixes at t
    { "t": 0.30, "voice": "Samantha", "who": "agent", "mouth": false,
      "text": "Congratulations! Eleven thousand dollars for twelve hours of recording." },
    { "t": 4.50, "voice": "Fred", "who": "stickman", "mouth": true, "text": "..." }
  ],
  "captions": [ { "from": 0.30, "to": 4.30, "text": "Agent: $11,000..." } ],
  "beats": [                  // the storyboard — pose segments covering [0, duration]
    { "from": 0.0, "to": 4.4, "pose": "talk-phone" }
  ],
  "sfx": [ { "t": 6.9, "type": "whoosh", "text": "WHOOSH" } ]  // procedural; types: ring|boing|whoosh|splash
}
```

## Rules
- `lines[].voice`: any macOS `say` voice (verify with `say -v '?'`). Fleet default: Fred (stickman), Samantha (phone voices), Boing (novelty characters).
- `lines[].who`: "stickman" (mouth animates) or anything else (off-screen/phone voice, stickman listens).
- `beats[].pose`: must exist in `studio/scenes/stickman-lib.js` POSES. Coverage must span [0, duration] with no gaps.
- Timing: **the audio builder measures real TTS durations and warns on overlaps** — retime the JSON until clean (skit-003 did this; expect 1 retime pass per new script).
- Captions: ≤2 lines of text, readable at 540px; windows must not exceed the beat they sit in.
- Content lanes: see `content-topics.md` — comedy/AI-satire on Page 1; no politics, no tragedy, no debate-bait.

## Pipeline order (per skit)
1. `scripts/validate_skit.py <name>` → PASS required
2. `studio/storyboard.html?name=<name>` → **human approval gate** (morning review)
3. `python3 scripts/build_skit_audio.py <name>` → clean (no OVERLAP warnings)
4. `studio/skit_template.html?name=<name>&encode=1` → wait for DONE
5. `studio/qc.html?src=/studio/ready-to-post/<file>` → playback check → verdict per SKIT-PIPELINE.md
