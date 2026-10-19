// Grand Welkin — one tiny enhancement: copy the contact email. No tracking, no deps.
(function () {
  "use strict";
  var btn = document.querySelector(".copy-btn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    var value = btn.getAttribute("data-copy") || "";
    var done = function () {
      var original = "Copy";
      btn.textContent = "Copied";
      btn.setAttribute("data-copied", "true");
      window.setTimeout(function () {
        btn.textContent = original;
        btn.removeAttribute("data-copied");
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () {});
    } else {
      // Fallback for older browsers.
      var el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(el);
    }
  });
})();
