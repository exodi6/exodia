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

  /* ---------- Hero stat counters (count up from 0 when scrolled into view) ---------- */
  var counters = document.querySelectorAll(".hero__stat .num[data-count-to]");
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (counters.length) {
    var renderCount = function (el, value) {
      var suffix = el.dataset.suffix || "";
      el.textContent = value + suffix;
    };
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) { renderCount(el, parseInt(el.dataset.countTo, 10)); });
    } else {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.dataset.countTo, 10);
          var duration = 1400;
          var startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            renderCount(el, Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          countIo.unobserve(el);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { countIo.observe(el); });
    }
  }

  /* ---------- Sticky mobile CTA + WhatsApp bubble (hidden during hero to avoid
     covering the hero price tag, shown once the hero scrolls out) ---------- */
  var stickyCta = document.getElementById("stickyCta");
  var floatWa = document.querySelector(".float-wa");
  var hero = document.getElementById("hero");
  if (hero && "IntersectionObserver" in window) {
    var heroIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (stickyCta) stickyCta.classList.toggle("is-visible", !entry.isIntersecting);
          if (floatWa) floatWa.classList.toggle("is-hidden", entry.isIntersecting);
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

  /* ---------- Plans: library+extension bundle vs X LAB extension alone ---------- */
  var PLANS = {
    bundle: { price: 999, anchor: 1999, label: "المكتبة الكاملة + إكستنشن X LAB" },
    extension: { price: 799, anchor: 1599, label: "إكستنشن X LAB فقط" }
  };
  var currentPlanKey = "bundle";
  var planCards = document.querySelectorAll("[data-plan]");
  var priceEls = document.querySelectorAll("[data-price-text]");
  var anchorEls = document.querySelectorAll("[data-plan-anchor]");

  /* ---------- Coupon verification (plan-aware) ---------- */
  var COUPONS = {
    "EX666": { type: "fixed", price: 499, onlyPlan: "bundle" },
    "HAMZA111": { type: "percent", value: 10 },
    "REWAN10": { type: "percent", value: 10 }
  };
  var couponInput = document.getElementById("couponCode");
  var couponCheckBtn = document.getElementById("couponCheckBtn");
  var couponFeedback = document.getElementById("couponFeedback");
  var appliedCouponCode = null;

  function showCouponFeedback(msg, ok) {
    if (!couponFeedback) return;
    couponFeedback.textContent = msg;
    couponFeedback.classList.remove("is-valid", "is-invalid");
    couponFeedback.classList.add(ok ? "is-valid" : "is-invalid");
  }

  function priceForCoupon(coupon, basePrice) {
    if (coupon.type === "fixed") return coupon.price;
    return Math.round(basePrice * (1 - coupon.value / 100));
  }

  function refreshPriceDisplay() {
    var plan = PLANS[currentPlanKey];
    var finalPrice = plan.price;

    if (appliedCouponCode) {
      var coupon = COUPONS[appliedCouponCode];
      if (coupon.onlyPlan && coupon.onlyPlan !== currentPlanKey) {
        appliedCouponCode = null;
        showCouponFeedback("الكود ده مخصص لباقة \"" + PLANS[coupon.onlyPlan].label + "\" بس، السعر رجع " + plan.price + " ج.م", false);
      } else {
        finalPrice = priceForCoupon(coupon, plan.price);
      }
    }

    window.__exodiaFinalPrice = finalPrice;
    window.__exodiaSelectedPlan = plan.label;

    priceEls.forEach(function (el) {
      el.textContent = el.dataset.priceText.replace("{price}", finalPrice);
    });
    anchorEls.forEach(function (el) {
      el.textContent = plan.anchor;
    });
  }

  function selectPlan(planKey) {
    if (!PLANS[planKey]) return;
    currentPlanKey = planKey;
    planCards.forEach(function (card) {
      card.classList.toggle("is-active", card.dataset.plan === planKey);
    });
    refreshPriceDisplay();
  }

  planCards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectPlan(card.dataset.plan);
    });
  });

  if (couponCheckBtn && couponInput && couponFeedback) {
    couponCheckBtn.addEventListener("click", function () {
      var code = couponInput.value.trim().toUpperCase();
      if (!code) {
        appliedCouponCode = null;
        refreshPriceDisplay();
        showCouponFeedback("اكتب كود الكوبون الأول", false);
        return;
      }
      var coupon = COUPONS[code];
      if (!coupon) {
        appliedCouponCode = null;
        refreshPriceDisplay();
        showCouponFeedback("الكود غير صحيح", false);
        return;
      }
      if (coupon.onlyPlan && coupon.onlyPlan !== currentPlanKey) {
        appliedCouponCode = null;
        refreshPriceDisplay();
        showCouponFeedback("الكود ده مخصص لباقة \"" + PLANS[coupon.onlyPlan].label + "\" بس", false);
        return;
      }
      appliedCouponCode = code;
      refreshPriceDisplay();
      showCouponFeedback("الكود صحيح ✓ السعر بقى " + window.__exodiaFinalPrice + " ج.م", true);
    });
    couponInput.addEventListener("input", function () {
      if (appliedCouponCode) {
        appliedCouponCode = null;
        refreshPriceDisplay();
      }
      couponFeedback.textContent = "";
      couponFeedback.classList.remove("is-valid", "is-invalid");
    });
  }

  refreshPriceDisplay();

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
      appliedCouponCode = null;
      selectPlan("bundle");
      if (couponFeedback) { couponFeedback.textContent = ""; couponFeedback.classList.remove("is-valid", "is-invalid"); }
    });
  }

  /* ---------- Limited-time offer countdown (rolling 24h window per visitor) ---------- */
  var promoTimerEl = document.getElementById("promoTimer");
  if (promoTimerEl) {
    var PROMO_KEY = "exodiaOfferDeadline";
    var PROMO_DURATION = 24 * 60 * 60 * 1000;
    var promoDeadline;
    try {
      promoDeadline = parseInt(localStorage.getItem(PROMO_KEY), 10);
    } catch (e) {
      promoDeadline = NaN;
    }
    if (!promoDeadline || isNaN(promoDeadline) || promoDeadline < Date.now()) {
      promoDeadline = Date.now() + PROMO_DURATION;
      try { localStorage.setItem(PROMO_KEY, promoDeadline); } catch (e) {}
    }
    var pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
    var tickPromo = function () {
      var diff = promoDeadline - Date.now();
      if (diff <= 0) {
        promoDeadline = Date.now() + PROMO_DURATION;
        try { localStorage.setItem(PROMO_KEY, promoDeadline); } catch (e) {}
        diff = PROMO_DURATION;
      }
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      promoTimerEl.textContent = pad2(h) + ":" + pad2(m) + ":" + pad2(s);
    };
    tickPromo();
    setInterval(tickPromo, 1000);
  }
})();
