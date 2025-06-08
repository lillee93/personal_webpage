function initAnimations() {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
  
    // —— Page Transition Timeline ——  
    const tl = gsap.timeline({ paused: true, defaults:{ ease: "power2.inOut" } });
  
    tl.to(".page.current", {
      xPercent: -30,
      opacity: 0,
      duration: 0.6
    });
    tl.fromTo(".page.next", {
        xPercent: 100,
        opacity: 0
      },{
        xPercent:   0,
        opacity:    1,
        duration:   0.8,
        onStart() { document.querySelector(".page.next").classList.add("current"); }
    });
  
    // Nav link handler
    document.querySelectorAll("a.nav").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const from = document.querySelector(".page.current");
        const to   = document.querySelector(a.getAttribute("href"));
        from.classList.remove("current");
        to.classList.add("next");
        tl.play(0).then(() => {
          from.classList.remove("next");
          to.classList.remove("next");
          to.classList.add("current");
          tl.pause(0);
        });
      });
    });
  
    // —— Scroll-Triggered Reveals ——  
    gsap.utils.toArray(".reveal").forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end:   "bottom 20%",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.6
      });
    });
  
    // —— Parallax Hero Bg ——  
    gsap.to(".hero-bg", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        scrub: true
      }
    });
  }
  