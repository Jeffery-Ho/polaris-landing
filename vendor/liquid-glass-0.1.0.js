// src/core/apply.ts
function applyGlass(el, filterId, tier) {
  el.style.setProperty("--lg-filter-url", `url(#${filterId})`);
  el.setAttribute("data-lg-active", "");
  el.setAttribute("data-lg-quality", tier);
}
function clearGlass(el) {
  el.style.removeProperty("--lg-filter-url");
  el.removeAttribute("data-lg-active");
  el.removeAttribute("data-lg-quality");
}

// src/core/map.ts
function mapGeometry(w, h, radius, border) {
  const inset = border * Math.min(w, h);
  const clamped = Math.min(radius, w / 2, h / 2);
  return { inset, radius: Math.max(clamped - inset, 2) };
}
function drawMap(ctx, w, h, geometry, mapBlur) {
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgb(0,0,0)");
  gx.addColorStop(1, "rgb(255,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgb(0,0,0)");
  gy.addColorStop(1, "rgb(0,0,255)");
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = `blur(${mapBlur}px)`;
  ctx.fillStyle = "rgba(128,128,128,0.93)";
  ctx.beginPath();
  ctx.roundRect(
    geometry.inset,
    geometry.inset,
    w - geometry.inset * 2,
    h - geometry.inset * 2,
    geometry.radius
  );
  ctx.fill();
  ctx.filter = "none";
}
async function createMapUrl(w, h, radius, border, mapBlur) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("liquid-glass: 2d canvas unavailable");
  drawMap(ctx, w, h, mapGeometry(w, h, radius, border), mapBlur);
  const blob = await new Promise((resolve) => {
    if (typeof canvas.toBlob === "function") canvas.toBlob(resolve);
    else resolve(null);
  });
  if (blob) {
    const url = URL.createObjectURL(blob);
    return { url, revoke: () => URL.revokeObjectURL(url) };
  }
  return { url: canvas.toDataURL(), revoke: () => {
  } };
}

// src/core/svg.ts
var SVG_NS = "http://www.w3.org/2000/svg";
var host = null;
var defs = null;
var filterCount = 0;
var uid = 0;
function ensureDefs() {
  if (defs && host?.isConnected) return defs;
  host = document.createElementNS(SVG_NS, "svg");
  host.setAttribute("width", "0");
  host.setAttribute("height", "0");
  host.setAttribute("aria-hidden", "true");
  host.setAttribute("data-lg-host", "");
  host.style.position = "absolute";
  defs = document.createElementNS(SVG_NS, "defs");
  host.appendChild(defs);
  document.body.appendChild(host);
  return defs;
}
function createFilter(scales) {
  const id = `lg-filter-${++uid}`;
  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", "100%");
  filter.setAttribute("height", "100%");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  const feImage = document.createElementNS(SVG_NS, "feImage");
  feImage.setAttribute("x", "0");
  feImage.setAttribute("y", "0");
  feImage.setAttribute("result", "map");
  feImage.setAttribute("preserveAspectRatio", "none");
  filter.appendChild(feImage);
  if (scales.length === 1) {
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "map");
    disp.setAttribute("scale", String(scales[0]));
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "B");
    filter.appendChild(disp);
  } else {
    const keep = [
      "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
      "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
      "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
    ];
    const channels = [];
    scales.forEach((scale, i) => {
      const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
      disp.setAttribute("in", "SourceGraphic");
      disp.setAttribute("in2", "map");
      disp.setAttribute("scale", String(scale));
      disp.setAttribute("xChannelSelector", "R");
      disp.setAttribute("yChannelSelector", "B");
      disp.setAttribute("result", `d${i}`);
      filter.appendChild(disp);
      const cm = document.createElementNS(SVG_NS, "feColorMatrix");
      cm.setAttribute("in", `d${i}`);
      cm.setAttribute("type", "matrix");
      cm.setAttribute("values", keep[i]);
      cm.setAttribute("result", `c${i}`);
      filter.appendChild(cm);
      channels.push(`c${i}`);
    });
    const blend1 = document.createElementNS(SVG_NS, "feBlend");
    blend1.setAttribute("in", channels[0]);
    blend1.setAttribute("in2", channels[1]);
    blend1.setAttribute("mode", "screen");
    blend1.setAttribute("result", "c01");
    filter.appendChild(blend1);
    const blend2 = document.createElementNS(SVG_NS, "feBlend");
    blend2.setAttribute("in", "c01");
    blend2.setAttribute("in2", channels[2]);
    blend2.setAttribute("mode", "screen");
    filter.appendChild(blend2);
  }
  ensureDefs().appendChild(filter);
  filterCount++;
  let removed = false;
  return {
    id,
    feImage,
    remove() {
      if (removed) return;
      removed = true;
      filter.remove();
      if (--filterCount === 0) {
        host?.remove();
        host = null;
        defs = null;
      }
    }
  };
}

// src/core/support.ts
var cached = null;
function isSupported() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (cached !== null) return cached;
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isSafari || isFirefox) return cached = false;
  if (typeof CSS === "undefined" || !CSS.supports("backdrop-filter", "url(#lg)")) {
    return cached = false;
  }
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 4;
    const ctx = c.getContext("2d");
    if (!ctx) return cached = false;
    ctx.getImageData(0, 0, 1, 1);
    return cached = true;
  } catch {
    return cached = false;
  }
}

// src/core/tiers.ts
var MQ = {
  reducedTransparency: "(prefers-reduced-transparency: reduce)",
  contrastMore: "(prefers-contrast: more)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  desktop: "(hover: hover) and (pointer: fine)"
};
function matches(query) {
  return window.matchMedia(query).matches;
}
function resolveQuality(opts = {}) {
  const { quality = "auto", allowLite = true, respectReducedMotion = true } = opts;
  if (quality === "off") return "off";
  if (typeof window === "undefined") return "off";
  if (!isSupported()) return "off";
  if (matches(MQ.reducedTransparency) || matches(MQ.contrastMore)) return "off";
  if (respectReducedMotion && matches(MQ.reducedMotion)) return "off";
  const nav = navigator;
  if (nav.connection?.saveData === true) return "off";
  if (quality === "high" || quality === "lite") return quality;
  if (matches(MQ.desktop)) return "high";
  const capableMobile = allowLite && (nav.deviceMemory ?? 4) >= 4 && (nav.hardwareConcurrency ?? 4) >= 4;
  return capableMobile ? "lite" : "off";
}
function observeQuality(opts, cb) {
  if (typeof window === "undefined") return () => {
  };
  let last = resolveQuality(opts);
  const emit = () => {
    const tier = resolveQuality(opts);
    if (tier !== last) {
      last = tier;
      cb(tier);
    }
  };
  const mqls = Object.values(MQ).map((q) => window.matchMedia(q));
  for (const mql of mqls) mql.addEventListener("change", emit);
  const connection = navigator.connection;
  connection?.addEventListener?.("change", emit);
  return () => {
    for (const mql of mqls) mql.removeEventListener("change", emit);
    connection?.removeEventListener?.("change", emit);
  };
}

// src/core/engine.ts
var DEFAULTS = {
  scale: -112,
  chroma: 6,
  border: 0.07,
  mapBlur: 12,
  radius: null
};
var RESIZE_DEBOUNCE_MS = 120;
function resolveRadius(el, w, h, override) {
  if (override != null) return override;
  const raw = getComputedStyle(el).borderTopLeftRadius || "0px";
  const v = parseFloat(raw) || 0;
  return raw.trim().endsWith("%") ? v / 100 * Math.min(w, h) : v;
}
var NOOP_INSTANCE = {
  tier: "off",
  refresh() {
  },
  destroy() {
  }
};
function liquidGlass(el, opts = {}) {
  const resolved = resolveQuality(opts);
  if (resolved === "off") return NOOP_INSTANCE;
  const tier = resolved;
  const o = { ...DEFAULTS, ...opts };
  const passes = opts.passes ?? (tier === "lite" ? 1 : 3);
  let scale = o.scale;
  let mapBlur = o.mapBlur;
  let chroma = passes === 1 ? 0 : o.chroma;
  if (tier === "lite") {
    scale = opts.liteOverrides?.scale ?? scale * 0.6;
    mapBlur = opts.liteOverrides?.mapBlur ?? mapBlur * 0.75;
  }
  const scales = passes === 1 ? [scale] : [scale, scale + chroma, scale + 2 * chroma];
  const parts = createFilter(scales);
  let destroyed = false;
  let applied = false;
  let generation = 0;
  let lastW = 0;
  let lastH = 0;
  let revokeCurrent = null;
  async function refresh(force) {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    if (!force && Math.abs(w - lastW) < 1 && Math.abs(h - lastH) < 1) return;
    lastW = w;
    lastH = h;
    const gen = ++generation;
    const map = await createMapUrl(
      w,
      h,
      resolveRadius(el, w, h, o.radius),
      o.border,
      mapBlur
    );
    if (destroyed || gen !== generation) {
      map.revoke();
      return;
    }
    revokeCurrent?.();
    revokeCurrent = map.revoke;
    parts.feImage.setAttribute("href", map.url);
    parts.feImage.setAttribute("width", String(w));
    parts.feImage.setAttribute("height", String(h));
    if (!applied) {
      applied = true;
      applyGlass(el, parts.id, tier);
    }
  }
  void refresh(true);
  let timer = null;
  const ro = new ResizeObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void refresh(false), RESIZE_DEBOUNCE_MS);
  });
  ro.observe(el);
  return {
    tier,
    refresh: () => void refresh(true),
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ro.disconnect();
      if (timer) clearTimeout(timer);
      parts.remove();
      revokeCurrent?.();
      revokeCurrent = null;
      clearGlass(el);
    }
  };
}
export {
  isSupported,
  liquidGlass,
  mapGeometry,
  observeQuality,
  resolveQuality
};
