;(() => {
  "use strict"

  const root = document.documentElement
  root.classList.remove("no-js")
  root.classList.add("js")

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  /* ---------- Theme (light default, persisted) ---------- */
  const themeToggle = document.getElementById("themeToggle")
  const stored = (() => {
    try {
      return localStorage.getItem("residence-theme")
    } catch (e) {
      return null
    }
  })()
  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored)
  }
  const syncThemeColor = () => {
    const theme = root.getAttribute("data-theme")
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute("content", theme === "dark" ? "#14110d" : "#f6f2ec")
  }
  syncThemeColor()
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark"
      root.setAttribute("data-theme", next)
      try {
        localStorage.setItem("residence-theme", next)
      } catch (e) {}
      syncThemeColor()
    })
  }

  /* ---------- Loader ---------- */
  const loader = document.getElementById("loader")
  const hideLoader = () => loader && loader.classList.add("is-hidden")
  window.addEventListener("load", () => {
    setTimeout(hideLoader, reduceMotion ? 0 : 1800)
  })
  setTimeout(hideLoader, 3800) // safety fallback

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

  /* ---------- Count-up numbers (in place, no movement) ---------- */
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

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
})()
