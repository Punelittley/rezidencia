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
    setTimeout(hideLoader, reduceMotion ? 0 : 1600)
  })
  setTimeout(hideLoader, 3600) // safety fallback

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

  /* ---------- Scroll reveal (staggered) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]")
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-in"))
  } else if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          // stagger siblings that share a parent
          const siblings = Array.from(el.parentElement ? el.parentElement.querySelectorAll(":scope > [data-reveal]") : [el])
          const idx = Math.max(0, siblings.indexOf(el))
          el.style.setProperty("--reveal-delay", (idx % 5) * 0.08 + "s")
          el.classList.add("is-in")
          obs.unobserve(el)
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )
    revealEls.forEach((el) => ro.observe(el))
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"))
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

  /* ---------- Services slider ---------- */
  const viewport = document.getElementById("servicesViewport")
  const dotsWrap = document.getElementById("servicesDots")
  const slider = document.getElementById("servicesSlider")
  if (viewport && slider) {
    const slides = Array.from(viewport.querySelectorAll(".svc-slide"))
    const prevBtn = slider.querySelector('[data-dir="prev"]')
    const nextBtn = slider.querySelector('[data-dir="next"]')

    const perView = () => {
      const w = window.innerWidth
      if (w <= 560) return 1
      if (w <= 980) return 2
      return 3
    }

    // Build dots (one per page)
    let dots = []
    const buildDots = () => {
      if (!dotsWrap) return
      const pages = Math.max(1, Math.ceil(slides.length / perView()))
      dotsWrap.innerHTML = ""
      dots = []
      for (let i = 0; i < pages; i++) {
        const b = document.createElement("button")
        b.type = "button"
        b.setAttribute("aria-label", "Перейти к группе " + (i + 1))
        b.addEventListener("click", () => {
          const step = viewport.clientWidth
          viewport.scrollTo({ left: step * i, behavior: "smooth" })
        })
        dotsWrap.appendChild(b)
        dots.push(b)
      }
    }

    const updateActive = () => {
      if (!dots.length) return
      const page = Math.round(viewport.scrollLeft / viewport.clientWidth)
      dots.forEach((d, i) => d.classList.toggle("is-active", i === page))
    }

    const scrollByCard = (dir) => {
      const slide = slides[0]
      const gap = parseFloat(getComputedStyle(viewport).columnGap || getComputedStyle(viewport).gap || "0")
      const step = (slide ? slide.getBoundingClientRect().width : viewport.clientWidth) + gap
      viewport.scrollBy({ left: dir * step * perView(), behavior: "smooth" })
    }

    if (prevBtn) prevBtn.addEventListener("click", () => scrollByCard(-1))
    if (nextBtn) nextBtn.addEventListener("click", () => scrollByCard(1))

    let raf = 0
    viewport.addEventListener(
      "scroll",
      () => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(updateActive)
      },
      { passive: true },
    )

    let resizeTimer = 0
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        buildDots()
        updateActive()
      }, 150)
    })

    buildDots()
    updateActive()
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
})()
