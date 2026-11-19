#!/usr/bin/env python3
"""SKIT-003 audio: mix Fred TTS lines + procedural SFX on one 48k mono timeline.
Outputs studio/skit-003-mix.wav + studio/skit-003-timeline.json (beats for the HTML)."""
import json, subprocess, wave, array, math, os

ROOT = '/Users/gonza/.zcode/workspace/draft-95d0ee14-e8b5-4387-9557-381180dcb1dd'
ST = f'{ROOT}/studio'
SR = 48000

LINES = [
    ('l1', "In twenty twenty six, thirty-eight percent of creators went faceless."),
    ('l2', "I did it the honest way. Born without one."),
    ('l3', "Avatar apps charge twenty-nine dollars a month. For this."),
    ('l4', "I've been faceless for free... since birth."),
]
for k, txt in LINES:
    aiff = f'{ST}/s3-{k}.aiff'
    subprocess.run(['say', '-v', 'Fred', '-o', aiff, txt], check=True)
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@48000', '-c', '1', aiff, f'{ST}/s3-{k}.wav'], check=True)

def read_wav(p):
    w = wave.open(p, 'rb')
    assert w.getframerate() == SR and w.getnchannels() == 1, (p, w.getparams())
    a = array.array('h'); a.frombytes(w.readframes(w.getnframes())); w.close()
    return a

def env_rms(a, win=960):
    return [math.sqrt(sum(x * x for x in a[i:i + win]) / win) / 32768 for i in range(0, len(a), win)]

def place(buf, clip, start_s, gain=1.0):
    i0 = int(start_s * SR)
    for i, x in enumerate(clip):
        j = i0 + i
        if j < len(buf): buf[j] += int(x * gain)

def sfx(kind, dur_s):
    n = int(dur_s * SR); a = array.array('h', [0] * n)
    if kind == 'pop':        # short 1kHz burst, fast decay
        for i in range(n):
            t = i / SR
            a[i] = int(9000 * math.sin(2 * math.pi * 1000 * t) * math.exp(-t * 45))
    elif kind == 'buzz':     # phone-ish double buzz
        for i in range(n):
            t = i / SR
            g = 1.0 if (t < 0.10 or (0.16 < t < 0.26)) else 0.0
            a[i] = int(6500 * math.sin(2 * math.pi * 170 * t) * g)
    elif kind == 'thud':     # flat low thump
        for i in range(n):
            t = i / SR
            a[i] = int(-11000 * math.sin(2 * math.pi * 62 * t) * math.exp(-t * 18))
    return a

clips = {k: read_wav(f'{ST}/s3-{k}.wav') for k, _ in LINES}
durs = {k: len(v) / SR for k, v in clips.items()}

t1 = 0.30
t2 = t1 + durs['l1'] + 0.55
t3 = t2 + durs['l2'] + 0.55
t4 = t3 + durs['l3'] + 0.65
end = t4 + durs['l4'] + 1.25

n = int(end * SR)
mix = array.array('h', [0] * n)
for k, start in (('l1', t1), ('l2', t2), ('l3', t3), ('l4', t4)):
    place(mix, clips[k], start, 0.92)
place(mix, sfx('pop', 0.25), 0.02, 0.55)
place(mix, sfx('buzz', 0.45), t3 - 0.50, 0.30)
place(mix, sfx('thud', 0.35), end - 0.80, 0.50)

peak = max(abs(x) for x in mix)
g = 0.85 * 32767 / peak
mix = array.array('h', [int(x * g) for x in mix])

with wave.open(f'{ST}/skit-003-mix.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(mix.tobytes())

timeline = {
    'duration': round(end, 3), 'sr': SR,
    'beats': {
        'hook': {'from': 0.0, 'to': round(t2 - 0.25, 2), 'voice_start': t1},
        'setup': {'from': round(t2 - 0.25, 2), 'to': round(t3 - 0.25, 2), 'voice_start': round(t2, 2)},
        'beat': {'from': round(t3 - 0.25, 2), 'to': round(t4 - 0.25, 2), 'voice_start': round(t3, 2)},
        'punch': {'from': round(t4 - 0.25, 2), 'to': round(end, 2), 'voice_start': round(t4, 2)},
    },
    'line_durs': {k: round(durs[k], 2) for k in durs},
}
with open(f'{ST}/skit-003-timeline.json', 'w') as f:
    json.dump(timeline, f, indent=1)
print(json.dumps(timeline, indent=1))
print('mix size:', os.path.getsize(f'{ST}/skit-003-mix.wav'), 'bytes')
