(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let flowerPointer = null;
  let typingTimer = null;
  let fireworksStarted = false;
  let fireworksFrame = 0;

  function showScene(id) {
    for (const scene of scenes) {
      const active = scene.id === id;
      scene.classList.toggle("active", active);
      scene.setAttribute("aria-hidden", String(!active));
      if (active) scene.removeAttribute("inert");
      else scene.setAttribute("inert", "");
    }
  }

  // Scatter the two different lily assets across the opening screen.
  // If an image has not been added to assets/ yet, it stays hidden rather than showing a broken icon.
  const lilyLayouts = [
    [5,10,155,-13,.83],[19,13,182,18,.94],[34,8,164,-7,.8],[51,14,194,12,.95],[68,8,172,-15,.87],[84,13,188,8,.92],[97,8,155,-12,.86],
    [1,39,182,15,.88],[14,34,194,-17,.96],[29,42,180,8,.82],[44,34,210,-7,.94],[60,42,180,16,.88],[75,35,205,-12,.98],[90,41,184,13,.9],[104,37,170,-8,.82],
    [7,69,194,-12,.9],[22,65,176,14,.84],[38,72,210,-15,.96],[55,65,180,9,.85],[71,72,198,-8,.96],[87,66,180,15,.88],[101,72,202,-13,.9],
    [0,96,168,11,.79],[15,91,205,-10,.95],[32,99,176,17,.88],[49,91,198,-15,.9],[66,98,175,8,.82],[82,91,208,-8,.98],[98,98,174,12,.86]
  ];
  const backLayer = $("#flower-layer-back");
  const frontLayer = $("#flower-layer-front");
  lilyLayouts.forEach((item, index) => {
    const image = document.createElement("img");
    image.className = "lily-flower";
    image.src = index % 3 === 0 ? "./assets/lily-3.png" : "./assets/lily-1.png";
    image.alt = "";
    image.draggable = false;
    image.style.setProperty("--x", `${item[0]}%`);
    image.style.setProperty("--y", `${item[1]}%`);
    image.style.setProperty("--size", `clamp(116px, ${item[2] / 7.2}vw, ${item[2]}px)`);
    image.style.setProperty("--rotation", `${item[3]}deg`);
    image.style.setProperty("--scale", index % 4 === 0 ? ".93" : "1");
    image.style.setProperty("--opacity", item[4]);
    image.style.setProperty("--delay", `${Math.min(index * 15, 300)}ms`);
    image.addEventListener("error", () => image.remove(), { once: true });
    (index % 2 === 0 ? backLayer : frontLayer).appendChild(image);
  });

  // Shared image fallback behaviour for assets the user has not added yet.
  document.querySelectorAll("img.asset-image").forEach((image) => {
    image.addEventListener("error", () => image.classList.add("image-missing"), { once: true });
  });

  function sweepFlowers() {
    const curtain = $("#flower-curtain");
    if (curtain.classList.contains("swept")) return;
    $("#flowers-scene").classList.add("sweeping");
    curtain.classList.add("swept");
    window.setTimeout(() => {
      showScene("panda-scene");
      startPandaMessage();
    }, prefersReducedMotion ? 40 : 1120);
  }

  const curtain = $("#flower-curtain");
  curtain.addEventListener("pointerdown", (event) => {
    if (curtain.classList.contains("swept")) return;
    flowerPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { curtain.setPointerCapture(event.pointerId); } catch (_) { /* Pointer capture is optional. */ }
  });
  curtain.addEventListener("pointerup", (event) => {
    if (!flowerPointer || flowerPointer.id !== event.pointerId) return;
    const dx = event.clientX - flowerPointer.x;
    const dy = event.clientY - flowerPointer.y;
    flowerPointer = null;
    if (dx < -28 || (Math.abs(dx) < 16 && Math.abs(dy) < 16)) sweepFlowers();
  });
  curtain.addEventListener("pointercancel", () => { flowerPointer = null; });
  curtain.addEventListener("keydown", (event) => {
    if (["Enter", " ", "ArrowLeft"].includes(event.key)) {
      event.preventDefault();
      sweepFlowers();
    }
  });

  function startPandaMessage() {
    const textElement = $("#typed-message");
    const caret = $(".typing-caret");
    const button = $("#open-gift-button");
    const message = "I've got something for you.";
    if (typingTimer) window.clearInterval(typingTimer);
    textElement.textContent = "";
    caret.classList.remove("done");
    button.disabled = true;
    if (prefersReducedMotion) {
      textElement.textContent = message;
      caret.classList.add("done");
      button.disabled = false;
      return;
    }
    let index = 0;
    typingTimer = window.setInterval(() => {
      textElement.textContent += message.charAt(index++);
      if (index >= message.length) {
        window.clearInterval(typingTimer);
        typingTimer = null;
        caret.classList.add("done");
        button.disabled = false;
      }
    }, 58);
  }

  $("#open-gift-button").addEventListener("click", () => showScene("gift-scene"));
  $("#unwrap-button").addEventListener("click", startFireworksScene);
  $("#next-button").addEventListener("click", () => showScene("letter-scene"));
  $("#finish-reading-button").addEventListener("click", startCoastScene);

  function startFireworksScene() {
    showScene("fireworks-scene");
    if (fireworksStarted) return;
    fireworksStarted = true;
    runFireworks();
  }

  // Lightweight canvas fireworks: rising rockets, bright cores, falling sparks and delayed mini-bursts.
  function runFireworks() {
    const canvas = $("#fireworks-canvas");
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      $("#next-button").hidden = false;
      return;
    }

    let width = 0, height = 0, dpr = 1, startTime = 0, lastLaunch = -1400;
    let nextShown = false;
    const rockets = [];
    const particles = [];
    const delayedBursts = [];
    const palette = ["#f4b9c8", "#f7d9de", "#e7bd82", "#ffe7bc", "#d8c5e9", "#a9c9d8"];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function addParticle(x, y, vx, vy, color, life, size, twinkle = false) {
      particles.push({ x, y, oldX: x, oldY: y, vx, vy, color, life, maxLife: life, size, gravity: 35 + Math.random() * 32, drag: .984 + Math.random() * .012, twinkle });
    }

    function launchRocket(now, elapsed) {
      const x = width * (.13 + Math.random() * .74);
      const targetY = height * (.16 + Math.random() * .39);
      const startY = height + 12;
      const duration = 690 + Math.random() * 280;
      rockets.push({ x, y: startY, startX: x, startY, targetY, started: now, duration, color: palette[Math.floor(Math.random() * 4)], trail: [] });
    }

    function burst(x, y, color, heart = false, secondary = false, now = performance.now()) {
      const count = secondary ? 18 : (heart ? 72 : 88);
      if (heart) {
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(angle), 3);
          const hy = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
          const speed = 6.4 + Math.random() * 2.0;
          addParticle(x, y, hx * speed, hy * speed, i % 6 === 0 ? "#fff0d1" : color, 1.55 + Math.random() * .35, 1.5 + Math.random() * 1.1, true);
        }
      } else {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (secondary ? 45 : 72) + Math.random() * (secondary ? 110 : 190);
          addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, i % 8 === 0 ? "#fff0d5" : color, .9 + Math.random() * .9, 1.1 + Math.random() * 1.5, Math.random() < .18);
        }
      }
      // Fine short-lived glints around the explosion core.
      for (let i = 0; i < (secondary ? 5 : 13); i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 18 + Math.random() * 50;
        addParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, "#fff6e8", .3 + Math.random() * .25, 1.1, true);
      }
      if (!secondary && Math.random() < .55) delayedBursts.push({ x, y, at: now + 320 + Math.random() * 190, color });
      const flash = ctx.createRadialGradient(x, y, 0, x, y, heart ? 72 : 56);
      flash.addColorStop(0, "rgba(255,238,214,.17)");
      flash.addColorStop(1, "rgba(255,238,214,0)");
      ctx.fillStyle = flash;
      ctx.beginPath(); ctx.arc(x, y, heart ? 72 : 56, 0, Math.PI * 2); ctx.fill();
    }

    function launchInterval(elapsed) {
      if (elapsed < 3000) return 1450;
      if (elapsed < 8300) return 1450 - ((elapsed - 3000) / 5300) * 1050;
      if (elapsed < 10500) return 400 + ((elapsed - 8300) / 2200) * 750;
      return 1150;
    }

    function frame(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const totalDuration = prefersReducedMotion ? 1600 : 12800;
      ctx.fillStyle = "rgba(25, 23, 36, .24)";
      ctx.fillRect(0, 0, width, height);

      for (let i = delayedBursts.length - 1; i >= 0; i--) {
        if (now >= delayedBursts[i].at) {
          const pending = delayedBursts.splice(i, 1)[0];
          burst(pending.x, pending.y, pending.color, false, true, now);
        }
      }

      if (elapsed < totalDuration && elapsed - lastLaunch >= launchInterval(elapsed)) {
        launchRocket(now, elapsed);
        lastLaunch = elapsed;
        if (elapsed > 7200 && Math.random() < .34) {
          window.setTimeout(() => {
            if (elapsed < totalDuration) launchRocket(performance.now(), elapsed);
          }, 140);
        }
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        const t = Math.min(1, (now - r.started) / r.duration);
        const eased = 1 - Math.pow(1 - t, 2.1);
        r.y = r.startY + (r.targetY - r.startY) * eased;
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();
        ctx.globalAlpha = .75;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        r.trail.forEach((p, j) => { if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff5de";
        ctx.beginPath(); ctx.arc(r.x, r.y, 2.1, 0, Math.PI * 2); ctx.fill();
        if (t >= 1) {
          rockets.splice(i, 1);
          const heartChance = elapsed > 5200 && elapsed < 9100 ? .2 : .07;
          burst(r.x, r.y, r.color, !prefersReducedMotion && Math.random() < heartChance, false, now);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.oldX = p.x; p.oldY = p.y;
        p.x += p.vx / 60;
        p.y += p.vy / 60;
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity / 60;
        p.life -= 1 / 60;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const fade = Math.max(0, Math.min(1, p.life / p.maxLife));
        const twinkle = p.twinkle ? (.55 + Math.random() * .45) : 1;
        ctx.globalAlpha = fade * twinkle;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * .8;
        ctx.beginPath(); ctx.moveTo(p.oldX, p.oldY); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed >= totalDuration && rockets.length === 0 && particles.length === 0 && delayedBursts.length === 0) {
        if (!nextShown) {
          nextShown = true;
          $("#next-button").hidden = false;
          window.removeEventListener("resize", resize);
        }
        return;
      }
      fireworksFrame = window.requestAnimationFrame(frame);
    }

    fireworksFrame = window.requestAnimationFrame(frame);
  }

  function startCoastScene() {
    const letterPaper = $("#letter-paper");
    const finishButton = $("#finish-reading-button");
    finishButton.disabled = true;
    letterPaper.classList.add("letter-exit");
    window.setTimeout(() => {
      showScene("coast-scene");
      const photo = $("#coast-photo");
      photo.addEventListener("error", () => {
        const fallback = photo.dataset.fallback;
        if (fallback && photo.src !== fallback) photo.src = fallback;
      }, { once: true });
    }, prefersReducedMotion ? 25 : 650);
  }

  // If the primary official image cannot be loaded, try the openly licensed Wikimedia rear photo.
  const coastPhoto = $("#coast-photo");
  coastPhoto.addEventListener("error", () => {
    const fallback = coastPhoto.dataset.fallback;
    if (fallback && !coastPhoto.dataset.fallbackTried) {
      coastPhoto.dataset.fallbackTried = "true";
      coastPhoto.src = fallback;
    }
  });
})();
