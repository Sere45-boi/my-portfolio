/* Reveal bento cards. Lives in a persistent script because barba does not run inline scripts of swapped-in pages. */
(function () {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  function scan() {
    document.querySelectorAll(".works-bento .flip:not(.seen)").forEach(function (el) { el.classList.add("seen"); io.observe(el); });
  }
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
