// Scripted product demos for the Features cards. Each runs only while its card is
// on screen; reduced motion shows a still, representative frame instead.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { window.clearTimeout(timer); reject(signal.reason); }, { once: true });
  });
}

function cursorApi(root, signal) {
  const cursor = root.querySelector(".demo-cursor");
  return {
    async moveTo(target, dx = 0.55, dy = 0.6) {
      if (!cursor || !target) return;
      const box = root.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      cursor.style.setProperty("--cx", `${rect.left - box.left + rect.width * dx}px`);
      cursor.style.setProperty("--cy", `${rect.top - box.top + rect.height * dy}px`);
      await wait(700, signal);
    },
    async click() {
      if (!cursor) return;
      cursor.classList.remove("is-click");
      void cursor.offsetWidth;
      cursor.classList.add("is-click");
      await wait(220, signal);
    },
    park() {
      cursor?.style.setProperty("--cx", "78%");
      cursor?.style.setProperty("--cy", "86%");
    }
  };
}

const text = (element) => (element?.textContent || "").trim();

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function windowOf(root) { return root.querySelector(".pv-window"); }

function setTab(root, tab) {
  const win = windowOf(root);
  win.dataset.tab = tab;
  const indicator = root.querySelector(".pv-indicator");
  root.querySelectorAll("[data-tab-btn]").forEach((button) => {
    const active = button.dataset.tabBtn === tab;
    button.classList.toggle("is-active", active);
    if (active && indicator) {
      indicator.style.setProperty("--ix", `${button.offsetLeft}px`);
      indicator.style.setProperty("--iw", `${button.offsetWidth}px`);
    }
  });
}

function scrollChat(root, id) {
  const track = root.querySelector("[data-track]");
  const section = root.querySelector(`.pv-sec[data-sec="${id}"]`);
  root.querySelectorAll(".pv-sec").forEach((item) => item.classList.toggle("is-hit", item === section));
  track.style.transform = section ? `translateY(${-Math.max(0, section.offsetTop - 8)}px)` : "";
}

function setActive(root, marker) {
  root.querySelectorAll(".pv-marker").forEach((item) => item.classList.toggle("is-active", item === marker));
}

function resetShell(root) {
  setTab(root, "navigation");
  setActive(root, null);
  root.querySelectorAll(".pv-marker").forEach((item) => item.classList.remove("is-hover"));
  root.querySelectorAll(".pv-sec").forEach((item) => item.classList.remove("is-hit"));
  const track = root.querySelector("[data-track]");
  if (track) track.style.transform = "";
  root.querySelector(".pv-tip")?.classList.remove("is-on");
}

async function hoverMarker(root, cursor, marker, signal, withTip = true) {
  await cursor.moveTo(marker, 0.35, 0.55);
  marker.classList.add("is-hover");
  const tip = root.querySelector(".pv-tip");
  if (withTip && tip) {
    const bodyElement = root.querySelector(".pv-body");
    const body = bodyElement.getBoundingClientRect();
    const scale = body.width / bodyElement.offsetWidth || 1;
    const rect = marker.getBoundingClientRect();
    tip.textContent = text(marker.querySelector(".pv-label"));
    tip.style.top = `${(rect.top - body.top) / scale - 2}px`;
    tip.style.right = `${(body.right - rect.left) / scale + 8}px`;
    tip.classList.add("is-on");
  }
  await wait(650, signal);
}

async function clickMarker(root, cursor, marker, signal) {
  await cursor.click();
  marker.classList.remove("is-hover");
  root.querySelector(".pv-tip")?.classList.remove("is-on");
  setActive(root, marker);
  scrollChat(root, marker.dataset.target);
}

const demos = {
  markers: {
    reset: resetShell,
    still(root) {
      resetShell(root);
      const marker = root.querySelector('.pv-marker[data-target="slips"]');
      setActive(root, marker);
      scrollChat(root, "slips");
    },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      for (const id of ["slips", "timeline", "owners", "checkin", "decision"]) {
        const marker = root.querySelector(`.pv-marker[data-target="${id}"]`);
        await hoverMarker(root, cursor, marker, signal);
        await clickMarker(root, cursor, marker, signal);
        await wait(1500, signal);
      }
    }
  },

  chapter: {
    show(root, id) {
      root.querySelectorAll("[data-chip]").forEach((chip) => chip.classList.toggle("is-on", chip.dataset.chip === id));
      root.querySelectorAll("[data-chapter-body]").forEach((body) => body.classList.toggle("is-on", body.dataset.chapterBody === id));
    },
    reset(root) { resetShell(root); this.show(root, "decision"); },
    still(root) { resetShell(root); setTab(root, "chapters"); this.show(root, "slips"); },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      await wait(500, signal);
      await cursor.moveTo(root.querySelector('[data-tab-btn="chapters"]'), 0.5, 0.6);
      await cursor.click();
      setTab(root, "chapters");
      await wait(1400, signal);
      for (const id of ["slips", "checkin"]) {
        await cursor.moveTo(root.querySelector(`[data-chip="${id}"]`), 0.5, 0.6);
        await cursor.click();
        this.show(root, id);
        await wait(2000, signal);
      }
      await cursor.moveTo(root.querySelector(".pv-modal-close"), 0.5, 0.6);
      await cursor.click();
      setTab(root, "navigation");
      await wait(1200, signal);
    }
  },

  search: {
    filter(root, query) {
      root.querySelector("[data-query]").textContent = query;
      const needle = query.toLocaleLowerCase();
      root.querySelectorAll(".pv-marker").forEach((marker) => {
        const label = marker.querySelector(".pv-label");
        const value = label.textContent;
        const user = marker.classList.contains("pv-marker--user");
        const index = needle && !user ? value.toLocaleLowerCase().indexOf(needle) : -1;
        marker.classList.toggle("is-gone", Boolean(needle) && index < 0);
        label.innerHTML = index < 0 ? escapeHtml(value)
          : `${escapeHtml(value.slice(0, index))}<mark>${escapeHtml(value.slice(index, index + query.length))}</mark>${escapeHtml(value.slice(index + query.length))}`;
      });
    },
    reset(root) { resetShell(root); root.classList.remove("is-typing"); this.filter(root, ""); },
    still(root) {
      this.reset(root);
      this.filter(root, text(root.querySelector("[data-query-src]")));
      const first = root.querySelector(".pv-marker[data-target]:not(.is-gone)");
      setActive(root, first);
      if (first) scrollChat(root, first.dataset.target);
    },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      const query = text(root.querySelector("[data-query-src]"));
      await cursor.moveTo(root.querySelector(".pv-search"), 0.3, 0.55);
      await cursor.click();
      root.classList.add("is-typing");
      for (let length = 1; length <= query.length; length += 1) {
        await wait(170, signal);
        this.filter(root, query.slice(0, length));
      }
      await wait(700, signal);
      root.classList.remove("is-typing");
      const first = root.querySelector(".pv-marker[data-target]:not(.is-gone)");
      if (first) {
        await hoverMarker(root, cursor, first, signal, false);
        await clickMarker(root, cursor, first, signal);
      }
      await wait(1800, signal);
      for (let length = query.length - 1; length >= 0; length -= 1) {
        await wait(60, signal);
        this.filter(root, query.slice(0, length));
      }
      await wait(600, signal);
    }
  },

  stream: {
    reset(root) {
      resetShell(root);
      root.querySelectorAll("[data-block]").forEach((block) => {
        block.classList.remove("is-on", "is-typing");
        block.querySelector("[data-typed]").textContent = "";
      });
      root.querySelectorAll(".pv-marker[data-target]").forEach((marker) => marker.classList.remove("is-in", "is-streaming"));
    },
    still(root) {
      this.reset(root);
      root.querySelectorAll("[data-block]").forEach((block) => {
        block.classList.add("is-on");
        block.querySelector("[data-typed]").textContent = text(block.querySelector(".ds-src"));
      });
      root.querySelectorAll(".pv-marker[data-target]").forEach((marker) => marker.classList.add("is-in"));
    },
    follow(root) {
      const scroll = root.querySelector(".pv-scroll");
      const track = root.querySelector("[data-track]");
      const overflow = track.scrollHeight - scroll.clientHeight - 40;
      track.style.transform = overflow > 0 ? `translateY(${-overflow}px)` : "";
    },
    async play(root, signal) {
      this.reset(root);
      await wait(500, signal);
      const markers = [...root.querySelectorAll(".pv-marker[data-target]")];
      for (const [index, block] of [...root.querySelectorAll("[data-block]")].entries()) {
        block.classList.add("is-on", "is-typing");
        markers.forEach((marker) => marker.classList.remove("is-streaming"));
        markers[index].classList.add("is-in", "is-streaming");
        const source = text(block.querySelector(".ds-src"));
        const typed = block.querySelector("[data-typed]");
        const step = /[㐀-鿿]/.test(source) ? 1 : 3;
        for (let length = step; length < source.length + step; length += step) {
          typed.textContent = source.slice(0, length);
          this.follow(root);
          await wait(45, signal);
        }
        block.classList.remove("is-typing");
        await wait(500, signal);
      }
      markers.forEach((marker) => marker.classList.remove("is-streaming"));
      await wait(2400, signal);
    }
  },

  platforms: {
    show(root, item) {
      root.querySelectorAll("[data-platform]").forEach((entry) => entry.classList.toggle("is-on", entry === item));
      root.querySelector("[data-site-icon]").src = item.querySelector("img").getAttribute("src");
      root.querySelector("[data-site-host]").textContent = item.dataset.host;
    },
    reset(root) { resetShell(root); this.show(root, root.querySelector("[data-platform]")); },
    still(root) { this.reset(root); setActive(root, root.querySelector('.pv-marker[data-target="slips"]')); },
    async play(root, signal) {
      const order = ["slips", "timeline", "checkin", "decision", "owners"];
      let index = 0;
      for (const item of root.querySelectorAll("[data-platform]")) {
        root.classList.add("is-switching");
        await wait(220, signal);
        this.show(root, item);
        const id = order[index++ % order.length];
        setActive(root, root.querySelector(`.pv-marker[data-target="${id}"]`));
        scrollChat(root, id);
        root.classList.remove("is-switching");
        await wait(1400, signal);
      }
    }
  },

  settings: {
    set(root, on) {
      root.querySelector("[data-toggle]").classList.toggle("is-on", on);
      root.classList.toggle("is-bold", on);
    },
    reset(root) { resetShell(root); this.set(root, false); },
    still(root) { this.reset(root); this.set(root, true); },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      await wait(400, signal);
      await cursor.moveTo(root.querySelector('[data-tab-btn="settings"]'), 0.5, 0.6);
      await cursor.click();
      setTab(root, "settings");
      await wait(900, signal);
      await cursor.moveTo(root.querySelector("[data-toggle]"), 0.5, 0.6);
      await cursor.click();
      this.set(root, true);
      await wait(1000, signal);
      await cursor.moveTo(root.querySelector('[data-tab-btn="navigation"]'), 0.4, 0.6);
      await cursor.click();
      setTab(root, "navigation");
      await wait(900, signal);
      for (const marker of root.querySelectorAll(".pv-marker[data-bold-marker]")) {
        await hoverMarker(root, cursor, marker, signal);
        await clickMarker(root, cursor, marker, signal);
        await wait(1500, signal);
      }
    }
  }
};

export function initFeatureDemos() {
  const roots = [...document.querySelectorAll("[data-demo]")].filter((root) => demos[root.dataset.demo]);
  const running = new Map();

  function stop(root) {
    running.get(root)?.abort();
    running.delete(root);
    root.classList.remove("is-playing");
  }

  async function start(root) {
    if (running.has(root)) return;
    const demo = demos[root.dataset.demo];
    if (reduceMotion.matches) { demo.still(root); return; }
    const controller = new AbortController();
    running.set(root, controller);
    root.classList.add("is-playing");
    cursorApi(root, controller.signal).park();
    try {
      while (!controller.signal.aborted) {
        demo.reset(root);
        await wait(400, controller.signal);
        await demo.play(root, controller.signal);
      }
    } catch {
      // Aborted when the card leaves the viewport or motion preferences change.
    }
  }

  // Scale each real-size window to its card.
  const fit = (root) => {
    const stage = root.querySelector(".pv-stage");
    if (stage) root.style.setProperty("--k", String(stage.clientWidth / 600));
    const win = windowOf(root);
    if (win) setTab(root, win.dataset.tab || "navigation");
  };
  document.fonts?.ready.then(() => roots.forEach(fit));
  roots.forEach(fit);
  if ("ResizeObserver" in window) {
    const resize = new ResizeObserver((entries) => entries.forEach((entry) => fit(entry.target.closest("[data-demo]"))));
    roots.forEach((root) => { const stage = root.querySelector(".pv-stage"); if (stage) resize.observe(stage); });
  }
  roots.forEach((root) => demos[root.dataset.demo].still(root));
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) start(entry.target);
    else stop(entry.target);
  }), { threshold: 0.35 });
  roots.forEach((root) => observer.observe(root));
  reduceMotion.addEventListener("change", () => roots.forEach((root) => {
    stop(root);
    demos[root.dataset.demo].still(root);
    observer.unobserve(root);
    observer.observe(root);
  }));
}

// Drives the real How it works windows with the same cursor, pausing whenever the
// visitor uses them. The demo controller owns all state changes.
export function initHowAutoplay(howDemo) {
  if (!howDemo) return;
  const section = document.querySelector(".how-section");
  const cursors = new Map();
  let controller = null;
  let visible = false;
  let pausedUntil = 0;

  howDemo.scenes.forEach((scene) => {
    const cursor = document.createElement("span");
    cursor.className = "demo-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 3.5 18.5 12l-6 1.6-3.2 5.4Z" fill="#fff" stroke="#2a2724" stroke-width="1.5" stroke-linejoin="round"></path></svg>';
    scene.browser.append(cursor);
    cursors.set(scene.mode, cursor);
  });

  const sequences = {
    toc: [["jump", "slips"], ["jump", "timeline"], ["jump", "checkin"], ["jump", "decision"]],
    outline: [["jump", "owners"], ["collapse"], ["collapse"], ["jump", "checkin"], ["jump", "decision"]]
  };

  async function run(signal) {
    while (!signal.aborted) {
      const mode = howDemo.state.activeFeature;
      const scene = howDemo.scenes.find((candidate) => candidate.mode === mode);
      const root = scene.browser;
      const cursor = cursorApi(root, signal);
      root.classList.add("is-playing");
      try {
        for (const [action, id] of sequences[mode]) {
          if (howDemo.state.activeFeature !== mode) break;
          const target = action === "collapse"
            ? scene.panel.querySelector("[data-how-collapse]")
            : scene.panel.querySelector(`[data-how-jump="${id}"]`);
          if (!target || target.closest("[hidden]")) continue;
          await cursor.moveTo(target, 0.3, 0.55);
          await cursor.click();
          if (action === "collapse") howDemo.toggleOutline();
          else howDemo.jumpTo(id);
          await wait(1700, signal);
        }
      } finally {
        root.classList.remove("is-playing");
      }
    }
  }

  function update() {
    const shouldRun = visible && !reduceMotion.matches && Date.now() >= pausedUntil;
    if (shouldRun && !controller) {
      controller = new AbortController();
      run(controller.signal).catch(() => {});
    } else if (!shouldRun && controller) {
      controller.abort();
      controller = null;
    }
  }

  function pause() {
    pausedUntil = Date.now() + 12000;
    update();
    window.setTimeout(update, 12100);
  }

  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((type) => {
    section.querySelector(".how-scenes").addEventListener(type, (event) => {
      if (event.isTrusted) pause();
    }, { passive: true });
  });

  // Restart on the newly active window when the scroll spy switches features.
  let lastMode = howDemo.state.activeFeature;
  window.setInterval(() => {
    if (howDemo.state.activeFeature !== lastMode) {
      lastMode = howDemo.state.activeFeature;
      controller?.abort();
      controller = null;
      update();
    }
  }, 400);

  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.2 })
    .observe(section.querySelector(".how-scenes"));
  reduceMotion.addEventListener("change", update);
}
