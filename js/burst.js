// The pink and yellow sunburst behind Webdog, built as separate SVG wedges so
// each ray can shoot out from the centre on its own.

const Burst = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const COLORS = ["#FF2D95", "#FFE11A"];
  const OVERLAP = 0.4; // degrees each wedge overlaps the next, hiding anti-aliasing seams

  const svg = document.getElementById("burst");
  const wrap = document.getElementById("burst-wrap");
  let rays = [];

  // The SVG is exactly window-sized (in px) with (0, 0) at the block's centre, so the
  // browser only ever paints what's on screen.
  function fit() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cy = (h * SETTINGS.size.y) / 100;
    svg.setAttribute("viewBox", `${-w / 2} ${-cy} ${w} ${h}`);
    const radius = Math.hypot(w, h);
    const point = (deg) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return `${(radius * Math.cos(a)).toFixed(1)} ${(radius * Math.sin(a)).toFixed(1)}`;
    };
    rays.forEach((ray, i) => {
      const from = (i / rays.length) * 360 - OVERLAP;
      const to = ((i + 1) / rays.length) * 360 + OVERLAP;
      ray.setAttribute("d", `M0 0L${point(from)}L${point(to)}Z`);
    });
  }

  function build(count) {
    svg.replaceChildren();
    rays = [];
    for (let i = 0; i < count; i++) {
      const ray = document.createElementNS(NS, "path");
      ray.setAttribute("fill", COLORS[i % COLORS.length]);
      svg.appendChild(ray);
      rays.push(ray);
    }
    fit();
    gsap.set(rays, { svgOrigin: "0 0", scale: 0 });
  }

  // The order the rays fire in, starting from 12 o'clock.
  function ordered(order) {
    const list = rays.slice();
    if (order === "counterclockwise") return [list[0], ...list.slice(1).reverse()];
    if (order === "random") return gsap.utils.shuffle(list);
    if (order === "alternating") {
      // all of one colour, then the other
      return [...list.filter((_, i) => i % 2 === 0), ...list.filter((_, i) => i % 2 === 1)];
    }
    if (order === "both ways") {
      // fans out from the top in both directions at once
      const result = [list[0]];
      for (let i = 1; i <= list.length / 2; i++) {
        result.push(list[i]);
        if (list.length - i !== i) result.push(list[list.length - i]);
      }
      return result;
    }
    return list; // clockwise
  }

  // Rays shoot out one by one. Returns the tween so it can sit on a timeline.
  function shootOut() {
    const { count, stagger, duration, ease, order } = SETTINGS.rays;
    if (rays.length !== count) build(count);
    gsap.set(wrap, { visibility: "visible" });
    return gsap.fromTo(ordered(order), { scale: 0 }, { scale: 1, duration, ease, stagger, svgOrigin: "0 0" });
  }

  function show() {
    if (rays.length !== SETTINGS.rays.count) build(SETTINGS.rays.count);
    gsap.killTweensOf(rays);
    gsap.set(rays, { scale: 1 });
    gsap.set(wrap, { visibility: "visible" });
  }

  function hide() {
    gsap.killTweensOf(rays);
    gsap.set(rays, { scale: 0 });
    gsap.set(wrap, { visibility: "hidden" });
  }

  build(SETTINGS.rays.count);
  window.addEventListener("resize", fit);
  return { shootOut, show, hide, fit };
})();
