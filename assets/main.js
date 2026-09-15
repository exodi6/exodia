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
  var reviewsHideWrap = document.getElementById("reviewsHideWrap");
  var reviewsHideBtn = document.getElementById("reviewsHideBtn");
  if (revealGate && reviewsGrid) {
    revealGate.addEventListener("click", function () {
      reviewsGrid.classList.remove("is-hidden");
      revealGate.style.display = "none";
      if (reviewsHideWrap) reviewsHideWrap.classList.remove("is-hidden");
    });
  }
  if (reviewsHideBtn && reviewsGrid && revealGate) {
    reviewsHideBtn.addEventListener("click", function () {
      reviewsGrid.classList.add("is-hidden");
      reviewsHideWrap.classList.add("is-hidden");
      revealGate.style.display = "";
      revealGate.scrollIntoView({ behavior: "smooth", block: "center" });
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

  /* ---------- Hero video: collapsed behind a button, opened in a modal ---------- */
  var heroVideoTrigger = document.getElementById("heroVideoTrigger");
  var videoModal = document.getElementById("videoModal");
  var videoModalFrame = document.getElementById("videoModalFrame");
  if (heroVideoTrigger && videoModal && videoModalFrame) {
    var HERO_VIDEO_SRC = "https://www.youtube-nocookie.com/embed/YtIvO2ihdX0?rel=0&modestbranding=1&autoplay=1";
    var openVideoModal = function () {
      var iframe = document.createElement("iframe");
      iframe.src = HERO_VIDEO_SRC;
      iframe.title = "شرح مكتبة EXODIA والبريفيو من داخل الموقع";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      videoModalFrame.innerHTML = "";
      videoModalFrame.appendChild(iframe);
      videoModal.classList.add("is-open");
    };
    var closeVideoModal = function () {
      videoModal.classList.remove("is-open");
      videoModalFrame.innerHTML = "";
    };
    heroVideoTrigger.addEventListener("click", openVideoModal);
    videoModal.addEventListener("click", function (e) {
      if (e.target === videoModal || e.target.closest(".video-modal__close")) closeVideoModal();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeVideoModal(); });
  }

  /* ---------- Products + real multi-item cart ---------- */
  var PRODUCTS = {
    bundle: { name: "الباقة الشاملة: المكتبة الكاملة + كل الإكستنشنز", price: 999, anchor: 2999 },
    xlab: { name: "إكستنشن X LAB فقط", price: 799, anchor: 1599 },
    autocut: { name: "إكستنشن الأوتوكات (كابشن + أوتوكات + داونلودر)", price: 499, anchor: 999 },
    textpresets: { name: "إكستنشن التيكست بريتس لبريمير", price: 499, anchor: 999 }
  };
  var cart = { bundle: true };
  var productCards = document.querySelectorAll("[data-product]");
  var priceEls = document.querySelectorAll("[data-price-text]");
  var anchorEls = document.querySelectorAll("[data-cart-anchor]");
  var cartListEl = document.getElementById("cartList");
  var cartEmptyEl = document.getElementById("cartEmpty");
  var cartTotalEl = document.getElementById("cartTotalRow");

  /* ---------- Coupon verification (cart-aware) ---------- */
  var COUPONS = {
    "EX666": { type: "fixed", price: 499, exactCart: ["bundle"] },
    "HAMZA111": { type: "percent", value: 10 },
    "REWAN10": { type: "percent", value: 10 }
  };
  var couponInput = document.getElementById("couponCode");
  var couponCheckBtn = document.getElementById("couponCheckBtn");
  var couponFeedback = document.getElementById("couponFeedback");
  var appliedCouponCode = null;

  function cartIds() { return Object.keys(cart); }
  function cartSubtotal() {
    return cartIds().reduce(function (sum, id) { return sum + PRODUCTS[id].price; }, 0);
  }
  function cartAnchorTotal() {
    return cartIds().reduce(function (sum, id) { return sum + (PRODUCTS[id].anchor || PRODUCTS[id].price); }, 0);
  }
  function cartMatchesExactly(ids) {
    var current = cartIds();
    if (current.length !== ids.length) return false;
    return ids.every(function (id) { return !!cart[id]; });
  }

  function showCouponFeedback(msg, ok) {
    if (!couponFeedback) return;
    couponFeedback.textContent = msg;
    couponFeedback.classList.remove("is-valid", "is-invalid");
    couponFeedback.classList.add(ok ? "is-valid" : "is-invalid");
  }

  function priceForCoupon(coupon, subtotal) {
    if (coupon.type === "fixed") return coupon.price;
    return Math.round(subtotal * (1 - coupon.value / 100));
  }

  function renderCart() {
    var ids = cartIds();
    if (cartListEl) {
      cartListEl.innerHTML = "";
      ids.forEach(function (id) {
        var product = PRODUCTS[id];
        var row = document.createElement("div");
        row.className = "cart-row";
        row.innerHTML =
          '<span class="cart-row__name">' + product.name + "</span>" +
          '<span class="cart-row__price">' + product.price + " ج.م</span>" +
          '<button type="button" class="cart-row__remove" data-remove="' + id + '" aria-label="شيل من السلة">✕</button>';
        cartListEl.appendChild(row);
      });
    }
    if (cartEmptyEl) cartEmptyEl.hidden = ids.length > 0;
    if (cartListEl) cartListEl.hidden = ids.length === 0;
    if (cartTotalEl) cartTotalEl.hidden = ids.length === 0;
  }

  function refreshPriceDisplay() {
    var subtotal = cartSubtotal();
    var finalPrice = subtotal;

    if (appliedCouponCode) {
      var coupon = COUPONS[appliedCouponCode];
      if (coupon.exactCart && !cartMatchesExactly(coupon.exactCart)) {
        appliedCouponCode = null;
        showCouponFeedback("الكود ده شغال بس لما السلة تكون فيها المنتج المخصص له بس، السعر رجع " + subtotal + " ج.م", false);
      } else {
        finalPrice = priceForCoupon(coupon, subtotal);
      }
    }

    window.__exodiaFinalPrice = finalPrice;
    window.__exodiaCartLabel = cartIds().map(function (id) { return PRODUCTS[id].name; }).join(" + ") || "لا يوجد منتج مختار";

    priceEls.forEach(function (el) {
      el.textContent = el.dataset.priceText.replace("{price}", finalPrice);
    });
    anchorEls.forEach(function (el) {
      el.textContent = cartAnchorTotal();
    });
    renderCart();
  }

  function updateCardStates() {
    productCards.forEach(function (card) {
      var active = !!cart[card.dataset.product];
      card.classList.toggle("is-active", active);
      var cta = card.querySelector(".product-card__cta");
      if (cta) cta.textContent = active ? "✓ مُضافة للسلة — دوس للإزالة" : "أضف للسلة";
    });
  }

  function toggleProduct(id) {
    if (!PRODUCTS[id]) return;
    var wasSelected = !!cart[id];
    if (wasSelected) {
      delete cart[id];
    } else {
      /* The bundle already includes every extension, so picking it replaces
         whatever's in the cart; picking any individual item while the bundle
         is active drops the bundle instead of stacking a redundant extra. */
      if (id === "bundle") {
        cart = {};
      } else if (cart.bundle) {
        delete cart.bundle;
      }
      cart[id] = true;
    }
    updateCardStates();
    refreshPriceDisplay();
    if (!wasSelected) {
      var orderFormEl = document.getElementById("orderForm");
      if (orderFormEl) orderFormEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  productCards.forEach(function (card) {
    card.addEventListener("click", function () {
      toggleProduct(card.dataset.product);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleProduct(card.dataset.product);
      }
    });
  });

  /* ---------- "Show all features" toggle per card (keeps cards compact by default) ---------- */
  document.querySelectorAll(".product-card__more").forEach(function (btn) {
    btn.dataset.moreLabel = btn.textContent;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var list = btn.closest(".product-card").querySelector(".product-card__features");
      var expanded = list.classList.toggle("is-expanded");
      btn.textContent = expanded ? "اقفل المميزات" : btn.dataset.moreLabel;
    });
  });

  if (cartListEl) {
    cartListEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-remove]");
      if (!btn) return;
      delete cart[btn.dataset.remove];
      updateCardStates();
      refreshPriceDisplay();
    });
  }

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
      if (coupon.exactCart && !cartMatchesExactly(coupon.exactCart)) {
        appliedCouponCode = null;
        refreshPriceDisplay();
        showCouponFeedback("الكود ده شغال بس لما السلة تكون فيها المنتج المخصص له بس", false);
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

  updateCardStates();
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

      if (cartIds().length === 0) {
        showCouponFeedback("اختار منتج واحد على الأقل من فوق قبل ما تكمل", false);
        var cardsAnchor = document.getElementById("pricing");
        if (cardsAnchor) cardsAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
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
      cart = { bundle: true };
      updateCardStates();
      refreshPriceDisplay();
      if (couponFeedback) { couponFeedback.textContent = ""; couponFeedback.classList.remove("is-valid", "is-invalid"); }
    });
  }

})();
