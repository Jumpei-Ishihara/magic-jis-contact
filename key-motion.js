// Each physical/pointer input owns its press; a release cannot strand another source.
export class KeyMotion {
  constructor(keys, {reduced = false} = {}) {
    this.keys = keys;
    this.reduced = reduced;
    for (const k of keys.values()) Object.assign(k, {
      sources: new Set(), depth: 0, held: false, moving: false,
      from: 0, to: 0, start: 0, duration: 1, downAt: -Infinity, releaseAt: null,
    });
  }
  sample(k, now) {
    if (!k.moving) return;
    const t = Math.max(0, Math.min(1, (now - k.start) / k.duration));
    const q = t - 1;
    const ease = k.to > 0 ? 1 - (1 - t) ** 3 : 1 + 2.15 * q ** 3 + 1.15 * q * q;
    k.depth = t === 1 ? k.to : k.from + (k.to - k.from) * ease;
    if (t === 1) k.moving = false;
  }
  target(k, down, now) {
    this.sample(k, now);
    k.from = k.depth;
    k.to = down ? 5.5 : 0;
    k.start = now;
    k.duration = this.reduced ? 1 : down ? 65 : 150;
    k.moving = true;
  }
  input(code, source, down, now) {
    const k = this.keys.get(code);
    if (!k || k.sources.has(source) === down) return false;
    if (down) k.sources.add(source); else k.sources.delete(source);
    const held = k.sources.size > 0;
    if (held === k.held) return false;
    k.held = held;
    if (held) {
      k.releaseAt = null;
      k.downAt = now;
      this.target(k, true, now);
    } else {
      const at = this.reduced ? now : Math.max(now, k.downAt + 65);
      if (at > now) k.releaseAt = at;
      else { k.releaseAt = null; this.target(k, false, now); }
    }
    return true;
  }
  releaseSource(source, now) {
    for (const [code] of this.keys) this.input(code, source, false, now);
  }
  reset() {
    for (const k of this.keys.values()) {
      k.sources.clear(); k.held = false; k.releaseAt = null;
      k.depth = k.from = k.to = 0; k.moving = false;
      k.group.position.y = k.baseY;
    }
  }
  tick(now) {
    let moving = false;
    for (const k of this.keys.values()) {
      if (k.releaseAt !== null && now >= k.releaseAt) {
        const at = k.releaseAt; k.releaseAt = null; this.target(k, false, at);
      }
      this.sample(k, now);
      k.group.position.y = k.baseY - k.depth;
      moving ||= k.moving || k.releaseAt !== null;
    }
    return moving;
  }
}
