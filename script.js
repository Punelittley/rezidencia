;(() => {
  "use strict"

  document.documentElement.classList.remove("no-js")

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById("preloader")
  window.addEventListener("load", () => {
    setTimeout(() => preloader && preloader.classList.add("is-done"), reduceMotion ? 0 : 1500)
  })
  // Safety fallback
  setTimeout(() => preloader && preloader.classList.add("is-done"), 3500)

  /* ---------- Header on scroll ---------- */
  const header = document.getElementById("header")
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled")
    else header.classList.remove("is-scrolled")
  }
  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true })

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger")
  const menu = document.getElementById("mobileMenu")
  const toggleMenu = (open) => {
    burger.classList.toggle("is-open", open)
    menu.classList.toggle("is-open", open)
    burger.setAttribute("aria-expanded", String(open))
    menu.setAttribute("aria-hidden", String(!open))
    document.body.style.overflow = open ? "hidden" : ""
  }
  burger.addEventListener("click", () => toggleMenu(!menu.classList.contains("is-open")))
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)))
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) toggleMenu(false)
  })

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal")
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"))
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target
            // stagger siblings a touch
            const delay = el.dataset.delay ? Number(el.dataset.delay) : 0
            setTimeout(() => el.classList.add("is-visible"), delay)
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )
    reveals.forEach((el) => io.observe(el))
  }

  /* ---------- Count-up numbers ---------- */
  const counters = document.querySelectorAll("[data-count]")
  const animateCount = (el) => {
    const target = Number(el.dataset.count)
    const suffix = el.dataset.suffix || ""
    if (reduceMotion) {
      el.textContent = target + suffix
      return
    }
    const duration = 1600
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(target * eased) + suffix
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target)
            co.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.6 },
    )
    counters.forEach((el) => co.observe(el))
  } else {
    counters.forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || "")))
  }

  /* ---------- Subtle parallax on hero strands ---------- */
  if (!reduceMotion) {
    const strands = document.querySelector(".hero__strands")
    if (strands) {
      window.addEventListener(
        "mousemove",
        (e) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 24
          const y = (e.clientY / window.innerHeight - 0.5) * 16
          strands.style.transform = `translate(${x}px, ${y}px)`
        },
        { passive: true },
      )
    }
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
})()
