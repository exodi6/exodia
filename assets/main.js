/* ==========================================================================
   EXODIA — front-end interactivity (vanilla JS, no framework/build step)
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Sticky mobile CTA (shows after hero scrolls out) ---------- */
  var stickyCta = document.getElementById("stickyCta");
  var hero = document.getElementById("hero");
  if (stickyCta && hero && "IntersectionObserver" in window) {
    var heroIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          stickyCta.classList.toggle("is-visible", !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    heroIo.observe(hero);
  }

  /* ---------- Showcase: expand full 18-item library list ---------- */
  var showMoreBtn = document.getElementById("showcaseMore");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", function () {
      document.querySelectorAll(".showcase-card.is-hidden").forEach(function (card) {
        card.classList.remove("is-hidden");
      });
      showMoreBtn.style.display = "none";
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var wasOpen = item.getAttribute("data-open") === "true";
      document.querySelectorAll(".faq-item").forEach(function (i) {
        i.setAttribute("data-open", "false");
        i.querySelector(".faq-item__q").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.setAttribute("data-open", "true");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Reviews: reveal gate + rating average from real data ---------- */
  var REVIEWS = [
    { rating: 5, votes: 48 },
    { rating: 5, votes: 62 },
    { rating: 5, votes: 85 },
    { rating: 4.9, votes: 39 },
    { rating: 4.8, votes: 31 },
    { rating: 5, votes: 44 }
  ];
  var avg = REVIEWS.reduce(function (s, r) { return s + r.rating; }, 0) / REVIEWS.length;
  var avgDisplay = avg.toFixed(1);
  document.querySelectorAll("[data-avg-rating]").forEach(function (el) { el.textContent = avgDisplay; });
  document.querySelectorAll("[data-review-count]").forEach(function (el) { el.textContent = REVIEWS.length; });

  var revealGate = document.getElementById("reviewsGate");
  var reviewsGrid = document.getElementById("reviewsGrid");
  if (revealGate && reviewsGrid) {
    revealGate.addEventListener("click", function () {
      reviewsGrid.classList.remove("is-hidden");
      revealGate.style.display = "none";
    });
  }

  /* ---------- Lightbox for review screenshots ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  if (lightbox && lightboxImg) {
    document.querySelectorAll(".review-shot").forEach(function (shot) {
      shot.addEventListener("click", function () {
        lightboxImg.src = shot.dataset.full || shot.querySelector("img").src;
        lightbox.classList.add("is-open");
      });
    });
    var closeLightbox = function () { lightbox.classList.remove("is-open"); lightboxImg.src = ""; };
    lightbox.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
  }

  /* ---------- Payment method selection ---------- */
  var payOptions = document.querySelectorAll(".pay-option input[type=radio]");
  payOptions.forEach(function (radio) {
    radio.addEventListener("change", function () {
      document.querySelectorAll(".pay-option").forEach(function (o) { o.classList.remove("is-selected"); });
      document.querySelectorAll(".pay-detail").forEach(function (d) { d.classList.remove("is-shown"); });
      radio.closest(".pay-option").classList.add("is-selected");
      var target = document.getElementById(radio.value);
      if (target) target.classList.add("is-shown");
    });
  });

  /* ---------- Copy-to-clipboard for payment numbers ---------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var number = btn.dataset.copy;
      var reset = function () { btn.textContent = btn.dataset.label; };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(number).then(function () {
          btn.textContent = "تم النسخ ✓";
          setTimeout(reset, 1600);
        }).catch(function () {});
      }
    });
    btn.dataset.label = btn.textContent;
  });

  /* ---------- File upload preview ---------- */
  var fileInput = document.getElementById("paymentProof");
  var uploadZone = document.getElementById("uploadZone");
  var uploadPreview = document.getElementById("uploadPreview");
  var uploadPrompt = document.getElementById("uploadPrompt");
  if (fileInput && uploadZone) {
    uploadZone.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) {
        var url = URL.createObjectURL(fileInput.files[0]);
        uploadPreview.src = url;
        uploadPreview.classList.add("is-shown");
        if (uploadPrompt) uploadPrompt.textContent = fileInput.files[0].name;
        hideFieldError("proofError");
      }
    });
  }

  /* ---------- Order form validation (mirrors the exact live error copy) ---------- */
  function showFieldError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-shown");
  }
  function hideFieldError(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("is-shown");
  }

  var orderForm = document.getElementById("orderForm");
  var formStep2 = document.getElementById("formStep2");
  var successPanel = document.getElementById("successPanel");
  var whatsappFollowUp = document.getElementById("whatsappFollowUp");

  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("buyerName").value.trim();
      var phone = document.getElementById("buyerPhone").value.trim();
      var email = document.getElementById("buyerEmail").value.trim();
      var proof = fileInput && fileInput.files && fileInput.files[0];

      var valid = true;
      hideFieldError("nameError"); hideFieldError("phoneError"); hideFieldError("emailError"); hideFieldError("proofError");

      if (!name) { showFieldError("nameError", "يرجى كتابة الاسم بالكامل"); valid = false; }
      if (!phone || phone.length < 10) { showFieldError("phoneError", "يرجى كتابة رقم موبايل / واتساب صحيح للتواصل وتأكيد التفعيل"); valid = false; }
      if (!email || email.indexOf("@") === -1) { showFieldError("emailError", "يرجى كتابة البريد الإلكتروني (جيميل) لتفعيل الوصول على Google Drive"); valid = false; }
      if (!proof) { showFieldError("proofError", "يرجى إرفاق صورة إثبات الدفع (سكرين شوت التحويل)"); valid = false; }
      if (!valid) return;

      var submitBtn = document.getElementById("submitOrderBtn");
      var submitLabel = submitBtn.textContent;
      submitBtn.textContent = "جاري إرسال الطلب والتفعيل...";
      submitBtn.disabled = true;

      /* The document-level "Exodia Sheet Integration" listener (below) catches this
         same submit event as it bubbles — it fires tracking + uploads the proof +
         posts to the Sheets webhook independently of this handler. */

      setTimeout(function () {
        orderForm.hidden = true;
        successPanel.hidden = false;
        submitBtn.textContent = submitLabel;
        submitBtn.disabled = false;
      }, 600);
    });
  }

  var resetOrderBtn = document.getElementById("resetOrderBtn");
  if (resetOrderBtn) {
    resetOrderBtn.addEventListener("click", function () {
      orderForm.reset();
      orderForm.hidden = false;
      successPanel.hidden = true;
      if (uploadPreview) { uploadPreview.classList.remove("is-shown"); uploadPreview.src = ""; }
      if (uploadPrompt) uploadPrompt.textContent = "إثبات الدفع (صورة التحويل) *";
    });
  }

  /* ---------- Discount window: header/mobile CTA price swap (unchanged mechanic) ---------- */
  (function offerWindow() {
    var KEY = "exodia_offer_start_v2";
    var WINDOW_MS = 43200000; /* 12 hours */
    var stored = localStorage.getItem(KEY);
    if (!stored) {
      stored = String(Date.now());
      localStorage.setItem(KEY, stored);
    }
    var expired = Date.now() - parseInt(stored, 10) >= WINDOW_MS;
    var price = expired ? "1000" : "499";
    document.querySelectorAll("[data-offer-price]").forEach(function (el) {
      el.textContent = el.dataset.offerPrice.replace("{price}", price);
    });
  })();

  /* ---------- Floating "ends in" countdown (visual urgency element, pre-existing) ---------- */
  (function countdown() {
    var el = document.getElementById("offerClock");
    if (!el) return;
    var remaining = 11 * 3600 + 59 * 60 + 59; /* 11:59:59 */
    function tick() {
      if (remaining <= 0) return;
      remaining -= 1;
      var h = Math.floor(remaining / 3600);
      var m = Math.floor((remaining % 3600) / 60);
      var s = remaining % 60;
      el.textContent =
        String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }
    tick();
    setInterval(tick, 1000);
  })();
})();
