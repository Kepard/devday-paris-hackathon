import { useCallback, useEffect, useRef, useState } from 'react';

const files = ['tap', 'pass', 'like', 'match'];
const cues = {
  tap: { file: 'tap', gain: .5 },
  pass: { file: 'pass', gain: .16 },
  like: { file: 'like', gain: .18 },
  match: { file: 'match', gain: .22 },
  flip: { file: 'pass', gain: .2, rate: .85 },
  send: { file: 'like', gain: .18, rate: 1.12 },
  receive: { file: 'tap', gain: .34 },
};

export function useInteractionSounds() {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem('fyd:sound-muted:v1') === 'true'; } catch { return false; }
  });
  const muteRef = useRef(muted);
  const engine = useRef(null);
  const active = useRef(new Set());
  const lastTap = useRef(0);

  useEffect(() => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const buffers = new Map();
    const abort = new AbortController();
    engine.current = { context, buffers };
    files.forEach(async name => {
      try {
        const response = await fetch(`/assets/sounds/${name}.wav`, { signal: abort.signal });
        if (!response.ok) return;
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        if (!abort.signal.aborted) buffers.set(name, buffer);
      } catch { /* Sound is an enhancement; interactions remain available. */ }
    });
    return () => { abort.abort(); engine.current = null; context.close().catch(() => {}); };
  }, []);

  const play = useCallback((name = 'tap') => {
    if (muteRef.current || document.hidden) return;
    const audio = engine.current;
    const cue = cues[name] || cues.tap;
    if (!audio || audio.context.state === 'closed') return;
    // Resume directly from the user's gesture, never on page load.
    if (audio.context.state === 'suspended') audio.context.resume().catch(() => {});
    const buffer = audio.buffers.get(cue.file);
    if (!buffer) return;
    if (name === 'tap' && performance.now() - lastTap.current < 65) return;
    if (name === 'tap') lastTap.current = performance.now();
    const source = audio.context.createBufferSource();
    const gain = audio.context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = cue.rate || 1;
    gain.gain.value = cue.gain;
    source.connect(gain); gain.connect(audio.context.destination);
    active.current.add(source);
    source.onended = () => { active.current.delete(source); source.disconnect(); gain.disconnect(); };
    source.start();
  }, []);

  const toggleMuted = useCallback(() => {
    const next = !muteRef.current;
    muteRef.current = next; setMuted(next);
    try { localStorage.setItem('fyd:sound-muted:v1', String(next)); } catch { /* Optional preference. */ }
    if (next) active.current.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } });
    else play('tap');
  }, [play]);

  return { muted, toggleMuted, play };
}
