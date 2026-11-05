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

const demos = {
  markers: {
    reset(root) {
      root.querySelector("[data-track]").style.transform = "";
      root.querySelectorAll(".dm-rail b").forEach((marker) => marker.classList.remove("is-on"));
      root.querySelectorAll("h5").forEach((heading) => heading.classList.remove("is-hit"));
      root.querySelector(".dm-tip").classList.remove("is-on");
    },
    still(root) {
      this.reset(root);
      root.querySelector('.dm-rail b[data-target="slips"]').classList.add("is-on");
    },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      const track = root.querySelector("[data-track]");
      const tip = root.querySelector(".dm-tip");
      const windowBox = root.querySelector(".dm-window");
      for (const id of ["slips", "timeline", "checkin", "decision"]) {
        const marker = root.querySelector(`.dm-rail b[data-target="${id}"]`);
        const heading = root.querySelector(`h5[data-sec="${id}"]`);
        await cursor.moveTo(marker, 0.8, 0.5);
        tip.textContent = text(heading);
        tip.style.top = `${marker.getBoundingClientRect().top - windowBox.getBoundingClientRect().top - 12}px`;
        tip.classList.add("is-on");
        await wait(650, signal);
        await cursor.click();
        tip.classList.remove("is-on");
        root.querySelectorAll(".dm-rail b").forEach((item) => item.classList.toggle("is-on", item === marker));
        root.querySelectorAll("h5").forEach((item) => item.classList.remove("is-hit"));
        track.style.transform = `translateY(${-Math.max(0, heading.offsetTop - 14)}px)`;
        await wait(750, signal);
        heading.classList.add("is-hit");
        await wait(1200, signal);
      }
    }
  },

  chapter: {
    show(root, id) {
      root.querySelectorAll("[data-chapter]").forEach((button) => button.classList.toggle("is-on", button.dataset.chapter === id));
      root.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("is-on", panel.dataset.panel === id));
    },
    reset(root) { this.show(root, "decision"); },
    still(root) { this.show(root, "slips"); },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      for (const id of ["slips", "checkin", "decision"]) {
        await cursor.moveTo(root.querySelector(`[data-chapter="${id}"]`), 0.35, 0.55);
        await cursor.click();
        this.show(root, id);
        await wait(2200, signal);
      }
    }
  },

  search: {
    render(root, query) {
      root.querySelector("[data-query]").textContent = query;
      const needle = query.toLocaleLowerCase();
      root.querySelectorAll("[data-item]").forEach((item) => {
        const label = text(item.querySelector(".ds-src"));
        const index = needle ? label.toLocaleLowerCase().indexOf(needle) : -1;
        item.classList.toggle("is-hidden", Boolean(needle) && index < 0);
        item.classList.remove("is-on");
        item.querySelector(".ds-label").innerHTML = index < 0 ? escapeHtml(label)
          : `${escapeHtml(label.slice(0, index))}<mark>${escapeHtml(label.slice(index, index + query.length))}</mark>${escapeHtml(label.slice(index + query.length))}`;
      });
    },
    reset(root) { root.classList.remove("is-typing"); this.render(root, ""); },
    still(root) {
      this.render(root, text(root.querySelector("[data-query-src]")));
      root.querySelector("[data-item]:not(.is-hidden)")?.classList.add("is-on");
    },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      const query = text(root.querySelector("[data-query-src]"));
      this.render(root, "");
      await cursor.moveTo(root.querySelector(".ds-field"), 0.4, 0.5);
      await cursor.click();
      root.classList.add("is-typing");
      for (let length = 1; length <= query.length; length += 1) {
        await wait(170, signal);
        this.render(root, query.slice(0, length));
      }
      await wait(700, signal);
      const first = root.querySelector("[data-item]:not(.is-hidden)");
      await cursor.moveTo(first, 0.3, 0.55);
      await cursor.click();
      first?.classList.add("is-on");
      root.classList.remove("is-typing");
      await wait(1600, signal);
      for (let length = query.length - 1; length >= 0; length -= 1) {
        await wait(60, signal);
        this.render(root, query.slice(0, length));
      }
      await wait(500, signal);
    }
  },

  stream: {
    reset(root) {
      root.querySelectorAll("[data-block]").forEach((block) => {
        block.classList.remove("is-on", "is-typing");
        block.querySelector("[data-typed]").textContent = "";
      });
      root.querySelectorAll(".dm-rail b").forEach((marker) => marker.classList.remove("is-in", "is-new"));
      root.querySelector(".dm-track").style.transform = "";
    },
    follow(root) {
      // Keep the newest streamed line in view, like a chat that auto-scrolls.
      const chat = root.querySelector(".dm-chat");
      const track = root.querySelector(".dm-track");
      const overflow = track.scrollHeight - chat.clientHeight;
      track.style.transform = overflow > 0 ? `translateY(${-overflow}px)` : "";
    },
    still(root) {
      root.querySelectorAll("[data-block]").forEach((block) => {
        block.classList.add("is-on");
        block.querySelector("[data-typed]").textContent = text(block.querySelector(".ds-src"));
      });
      root.querySelectorAll(".dm-rail b").forEach((marker) => marker.classList.add("is-in"));
    },
    async play(root, signal) {
      this.reset(root);
      await wait(500, signal);
      const markers = [...root.querySelectorAll(".dm-rail b")];
      const blocks = [...root.querySelectorAll("[data-block]")];
      for (const [index, block] of blocks.entries()) {
        block.classList.add("is-on", "is-typing");
        markers.forEach((marker) => marker.classList.remove("is-new"));
        markers[index].classList.add("is-in", "is-new");
        const source = text(block.querySelector(".ds-src"));
        const typed = block.querySelector("[data-typed]");
        const step = /[㐀-鿿]/.test(source) ? 1 : 3;
        for (let length = step; length < source.length + step; length += step) {
          typed.textContent = source.slice(0, length);
          this.follow(root);
          await wait(45, signal);
        }
        block.classList.remove("is-typing");
        await wait(450, signal);
      }
      markers.forEach((marker) => marker.classList.remove("is-new"));
      await wait(2200, signal);
    }
  },

  platforms: {
    show(root, item) {
      root.querySelectorAll("[data-platform]").forEach((entry) => entry.classList.toggle("is-on", entry === item));
      root.querySelector("[data-tab-icon]").src = item.querySelector("img").getAttribute("src");
      root.querySelector("[data-tab-name]").textContent = text(item.querySelector("span"));
      root.querySelector("[data-tab-host]").textContent = item.dataset.host;
    },
    reset(root) { this.show(root, root.querySelector("[data-platform]")); },
    still(root) { this.reset(root); },
    async play(root, signal) {
      for (const item of root.querySelectorAll("[data-platform]")) {
        root.classList.add("is-switching");
        await wait(220, signal);
        this.show(root, item);
        root.classList.remove("is-switching");
        await wait(1300, signal);
      }
    }
  },

  settings: {
    set(root, on) {
      root.querySelector("[data-toggle]").classList.toggle("is-on", on);
      root.classList.toggle("is-bold", on);
    },
    reset(root) { this.set(root, false); },
    still(root) { this.set(root, true); },
    async play(root, signal) {
      const cursor = cursorApi(root, signal);
      const toggle = root.querySelector("[data-toggle]");
      for (const on of [true, false]) {
        await cursor.moveTo(toggle, 0.5, 0.6);
        await cursor.click();
        this.set(root, on);
        await wait(2200, signal);
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
