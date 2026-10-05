/* ==========================================================================
   SUSHOMA — AUTHENTICATION SYSTEM  (script.js)
   --------------------------------------------------------------------------
   1. CONFIG   -> change logo, slogan, brand name, contacts, API link here
   2. I18N     -> Bangla / English texts
   3. LOGIC    -> verify (JSONP), verification counter, popup, share
   ========================================================================== */

/* ==========================================================================
   1. CONFIG  (everything you may want to edit is here)
   ========================================================================== */
const CONFIG = {
    // Google Apps Script web-app URL used for verification
    API_URL: "https://script.google.com/macros/s/AKfycbz1KEXA9J9rabKCHKiv6GkUQniD6D_xSnyDvJB2JzMSSpJgp20XtFgJq2wE-pZGE4hr/exec",

    BRAND: {
        name: "SUSHOMA",
        logo: "logo-circle.webp",          // logo file path (put your logo next to index.html)
        logoFit: "cover",                  // "cover" (fills the circle) or "contain" (shows whole logo)
        logoFallback: "🌿",                // shown if the logo file is missing
        slogan: {
            bn: "চুলের যত্নে প্রকৃতির ছোঁয়া",
            en: "Nature's Touch for Healthy Hair"
        }
    },

    SITE_URL: "https://sushoma.com",       // "Back to main website" button goes here
    VERIFY_PAGE_URL: "",                   // link shared with the message. Empty = this page's own URL

    CONTACT: {
        website: "https://sushoma.com",
        email: "care@sushoma.com",
        phones: ["01715456159", "01718019568"],
        whatsapp: "8801715456159",
        messenger: "sushoma.haircare",
        facebook: "sushoma.haircare",
        address: {
            bn: "ইছাকাঠি, কাশিপুর, বরিশাল-৮২০০",
            en: "Ichakathi, Kashipur, Barishal-8200"
        }
    },

    TIMEOUT_MS: 15000,        // API wait time
    AUTO_VERIFY_FROM_URL: true, // QR link like  /index.html?id=SH-2026-000001  verifies automatically
    CONFETTI: true,
    DUST_PARTICLES: 18
};

/* ==========================================================================
   2. TRANSLATIONS
   ========================================================================== */
const I18N = {
    bn: {
        back: "মূল ওয়েবসাইট",
        langSwitch: "English",
        badge: "অফিসিয়াল অথেনটিকেশন",
        trust1: "বিএসটিআই অনুমোদিত পণ্য",
        trust2: "১০০% প্রাকৃতিক ও কেমিক্যাল মুক্ত",
        trust3: "সিকিউর ডিজিটাল ভেরিফিকেশন",
        title: "পণ্যের সত্যতা যাচাই",
        subtitle: "আপনার সুষমা পণ্যটি ১০০% আসল কি না নিশ্চিত হতে নিচের বক্সে প্রোডাক্ট আইডি লিখুন।",
        label: "সিকিউর প্রোডাক্ট আইডি",
        placeholder: "যেমন: SH-2026-000001",
        verifyBtn: "সত্যতা যাচাই করুন",
        verifying: "যাচাই করা হচ্ছে...",
        contactHeader: "সরাসরি যোগাযোগ",
        cWebsite: "ওয়েবসাইট",
        cHotline: "হটলাইন",
        goSite: "মূল ওয়েবসাইটে ফিরে যান",
        visitSite: "ওয়েবসাইট ভিজিট করুন",
        footer: "সুষমা সিকিউর ভল্ট",
        errEmpty: "অনুগ্রহ করে আপনার প্রোডাক্ট আইডি লিখুন।",

        okTitle: "আসল ও পরীক্ষিত পণ্য",
        okMsg: "<strong>আপনার যাচাইকৃত পণ্যটি SUSHOMA-এর ১০০% আসল ও বিশুদ্ধ পণ্য।</strong><br>আমাদের অফিসিয়াল ডাটাবেজ দ্বারা এটি সফলভাবে ভেরিফাই করা হয়েছে। 🌿",
        notVerTitle: "পণ্যটি যাচাই করা যায়নি",
        notVerMsg: "উক্ত পণ্যটির Authentic status নিশ্চিত করা যায়নি।",
        notFoundTitle: "পণ্যটি পাওয়া যায়নি",
        notFoundMsg: "উক্ত আইডিটি আমাদের ডাটাবেজে পাওয়া যায়নি। আইডিটি আবার সঠিকভাবে লিখে চেষ্টা করুন।",
        errTitle: "যাচাই করা সম্ভব হয়নি",
        errMsg: "এই মুহূর্তে সংযোগ করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
        failAdvice: "নকল ও প্রতারণা এড়াতে সর্বদা আমাদের অফিসিয়াল চ্যানেল থেকে পণ্য সংগ্রহ করুন। আপনার আস্থাই আমাদের সবচেয়ে বড় অর্জন।",

        infoName: "পণ্যের নাম",
        infoId: "প্রোডাক্ট আইডি",
        infoBatch: "ব্যাচ নং",
        infoMfg: "উৎপাদন তারিখ",
        infoExp: "মেয়াদোত্তীর্ণ",

        shareTitle: "বন্ধুদের সাথে শেয়ার করুন",
        shareCopy: "মেসেজ কপি",
        shareMore: "আরও অপশন",
        sharePreview: "শেয়ার মেসেজের প্রিভিউ দেখুন",
        copied: "মেসেজ কপি হয়েছে ✓",
        copiedMessenger: "মেসেজ কপি হয়েছে — Messenger-এ পেস্ট করে পাঠান ✓",
        another: "অন্য প্রোডাক্ট যাচাই করুন",

        shAuth: "অথেনটিসিটি ভেরিফায়েড",
        shLead: "আমার পণ্যটি ১০০% আসল ও যাচাইকৃত! ✔",
        shCheck: "আপনার পণ্যটিও যাচাই করুন",
        callNow: "কল করুন"
    },
    en: {
        back: "Main Website",
        langSwitch: "বাংলা",
        badge: "Official Authentication",
        trust1: "BSTI Approved Product",
        trust2: "100% Natural & Chemical-Free",
        trust3: "Secure Digital Verification",
        title: "Product Authentication",
        subtitle: "Enter your secure product ID below to confirm your SUSHOMA product is 100% genuine.",
        label: "Secure Product ID",
        placeholder: "e.g. SH-2026-000001",
        verifyBtn: "Verify Authenticity",
        verifying: "Verifying...",
        contactHeader: "Direct Concierge",
        cWebsite: "Website",
        cHotline: "Hotline",
        goSite: "Go to Main Website",
        visitSite: "Visit Website",
        footer: "SUSHOMA Secure Vault",
        errEmpty: "Please enter your Product ID.",

        okTitle: "Authentic & Genuine",
        okMsg: "<strong>Your item is an official, 100% genuine SUSHOMA product.</strong><br>Successfully verified through our official database. 🌿",
        notVerTitle: "Product Not Verified",
        notVerMsg: "The authentic status of this product could not be confirmed.",
        notFoundTitle: "Product Not Found",
        notFoundMsg: "This ID was not found in our database. Please re-check the ID and try again.",
        errTitle: "Could Not Verify",
        errMsg: "We couldn't connect right now. Please try again in a moment.",
        failAdvice: "To avoid counterfeits, always buy from our official channels. Your trust is our greatest achievement.",

        infoName: "Product Name",
        infoId: "Product ID",
        infoBatch: "Batch No",
        infoMfg: "MFG Date",
        infoExp: "EXP Date",

        shareTitle: "Share with your circle",
        shareCopy: "Copy message",
        shareMore: "More options",
        sharePreview: "Preview share message",
        copied: "Message copied ✓",
        copiedMessenger: "Message copied — paste it in Messenger ✓",
        another: "Verify Another Item",

        shAuth: "Authenticity Verified",
        shLead: "My product is 100% genuine & verified! ✔",
        shCheck: "Verify your product too",
        callNow: "Call now"
    }
};

/* ==========================================================================
   3. LOGIC
   ========================================================================== */
const $ = (id) => document.getElementById(id);
const state = { lang: "bn", loading: false, result: null };

const els = {
    form: $("verifyForm"), input: $("productId"), inputArea: $("inputArea"), fieldError: $("fieldError"),
    verifyBtn: $("verifyBtn"), btnText: $("btnText"),
    contactGrid: $("contactGrid"), contactAddress: $("contactAddress"),
    overlay: $("popupOverlay"), popup: $("popup"), popupIcon: $("popupIcon"),
    popupTitle: $("popupTitle"), popupMessage: $("popupMessage"),
    productInfo: $("productInfo"), failContact: $("failContact"),
    shareSection: $("shareSection"), sharePreview: $("sharePreview"), nativeShareBtn: $("nativeShareBtn"),
    toast: $("toast")
};

/* ---------- helpers ---------- */
const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || key;
const icon = (name) => `<svg class="ico" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const num = (n) => (state.lang === "bn" ? toBn(n) : String(n));
const normalizeId = (v) => String(v || "").replace(/\s+/g, "").toUpperCase();
const hostOf = (url) => String(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
const shareUrl = () => CONFIG.VERIFY_PAGE_URL || location.href.split(/[?#]/)[0];

function fmtDate(v) {
    if (v === null || v === undefined || v === "") return "—";
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const d = new Date(s);
        if (!isNaN(d)) return d.toLocaleDateString(state.lang === "bn" ? "bn-BD" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    return s;
}

function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.remove("show"), 2600);
}

/* ---------- brand / contact rendering ---------- */
function renderBrand() {
    const B = CONFIG.BRAND;
    $("brandName").textContent = B.name;
    $("brandSlogan").textContent = B.slogan[state.lang] || B.slogan.bn;
    $("logoFallback").textContent = B.logoFallback;
    const img = $("brandLogo");
    if (!img.dataset.bound) {
        img.dataset.bound = "1";
        img.style.objectFit = B.logoFit || "cover";
        img.addEventListener("error", () => $("logoRing").classList.add("no-logo"));
        img.src = B.logo;
    }
}

function contactChip(ic, text, href, external) {
    const ext = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a class="contact-item" href="${esc(href)}"${ext}><span class="c-ico">${icon(ic)}</span><span class="t">${esc(text)}</span></a>`;
}

function renderContact() {
    const C = CONFIG.CONTACT;
    const items = [
        contactChip("globe", hostOf(C.website), C.website, true),
        contactChip("mail", C.email, "mailto:" + C.email),
        ...C.phones.map((p) => contactChip("phone", p, "tel:" + p)),
        contactChip("whatsapp", "WhatsApp", "https://wa.me/" + C.whatsapp, true),
        contactChip("messenger", "Messenger", "https://m.me/" + C.messenger, true),
        contactChip("facebook", "Facebook", "https://facebook.com/" + C.facebook, true)
    ];
    els.contactGrid.innerHTML = items.join("");
    els.contactAddress.innerHTML = `${icon("pin")}<span>${esc(C.address[state.lang] || C.address.bn)}</span>`;
}

/* ---------- language ---------- */
function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $("langText").textContent = t("langSwitch");
    renderBrand();
    renderContact();
    refreshButton();
    if (els.fieldError && !els.fieldError.hidden) els.fieldError.textContent = t("errEmpty");
    if (state.result) renderPopup();
}

function toggleLanguage() {
    state.lang = state.lang === "bn" ? "en" : "bn";
    try { localStorage.setItem("sushoma_lang", state.lang); } catch (e) { /* ignore */ }
    applyLanguage();
}

/* ---------- loading state ---------- */
function refreshButton() {
    els.btnText.textContent = state.loading ? t("verifying") : t("verifyBtn");
}
function setLoading(on) {
    state.loading = on;
    els.verifyBtn.disabled = on;
    els.verifyBtn.classList.toggle("loading", on);
    refreshButton();
}

function setFieldError(msg) {
    els.inputArea.classList.toggle("invalid", !!msg);
    els.fieldError.hidden = !msg;
    els.fieldError.textContent = msg || "";
}

/* ---------- verification (JSONP) ---------- */
function verifyProduct() {
    if (state.loading) return;
    const id = normalizeId(els.input.value);
    if (!id) { setFieldError(t("errEmpty")); els.input.focus(); return; }
    setFieldError("");
    setLoading(true);

    const cbName = "sushomaCb_" + Date.now() + "_" + Math.floor(Math.random() * 1e4);
    const script = document.createElement("script");
    let finished = false;

    const finish = (fn) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        window[cbName] = function () { /* ignore late responses */ };
        script.remove();
        setLoading(false);
        fn();
    };
    const timer = setTimeout(() => finish(() => showResult("error")), CONFIG.TIMEOUT_MS);

    window[cbName] = (data) => finish(() => handleResponse(data));
    script.onerror = () => finish(() => showResult("error"));

    const sep = CONFIG.API_URL.includes("?") ? "&" : "?";
    script.src = `${CONFIG.API_URL}${sep}id=${encodeURIComponent(id)}&callback=${encodeURIComponent(cbName)}&_=${Date.now()}`;
    document.body.appendChild(script);
}

function handleResponse(data) {
    if (data && data.success === true) {
        if (String(data.status).trim().toLowerCase() === "authentic") showResult("success", data);
        else showResult("notVerified", data);
    } else {
        showResult("notFound", data);
    }
}

function showResult(kind, data) {
    state.result = { kind, data: data || {} };
    renderPopup();
    openPopup();
    if (kind === "success" && CONFIG.CONFETTI && typeof confetti === "function") {
        confetti({ particleCount: 130, spread: 80, origin: { y: 0.65 }, colors: ["#d4af37", "#f3e5ab", "#13a56d", "#ffffff"] });
    }
}

/* ---------- popup rendering ---------- */
function renderPopup() {
    const r = state.result;
    if (!r) return;
    const ok = r.kind === "success";
    els.popup.className = "popup glass " + (ok ? "is-success" : "is-failed");
    els.popupIcon.innerHTML = icon(ok ? "check" : "alert");

    const titles = { success: "okTitle", notVerified: "notVerTitle", notFound: "notFoundTitle", error: "errTitle" };
    const msgs = { success: "okMsg", notVerified: "notVerMsg", notFound: "notFoundMsg", error: "errMsg" };
    els.popupTitle.textContent = t(titles[r.kind]);
    els.popupMessage.innerHTML = ok ? t("okMsg") : `${t(msgs[r.kind])}<br><br>${t("failAdvice")}`;

    if (ok) {
        const d = r.data;
        els.productInfo.hidden = false;
        els.productInfo.innerHTML = [
            ["infoName", d.product_name],
            ["infoId", d.product_id],
            ["infoBatch", d.batch_no],
            ["infoMfg", fmtDate(d.mfg_date)],
            ["infoExp", fmtDate(d.exp_date)]
        ].map(([k, v]) => `<div class="info-row"><span class="info-label">${t(k)}</span><span class="info-value">${esc(v === "" || v == null ? "—" : v)}</span></div>`).join("");

        els.failContact.hidden = true;
        els.shareSection.hidden = false;
        els.sharePreview.textContent = buildShareMessage(true);
        els.nativeShareBtn.hidden = !navigator.share;
    } else {
        els.productInfo.hidden = true;
        els.productInfo.innerHTML = "";
        els.shareSection.hidden = true;
        const C = CONFIG.CONTACT;
        els.failContact.hidden = false;
        els.failContact.innerHTML =
            contactChip("phone", `${t("callNow")} ${C.phones[0]}`, "tel:" + C.phones[0]) +
            contactChip("whatsapp", "WhatsApp", "https://wa.me/" + C.whatsapp, true);
    }
}

function openPopup() {
    els.overlay.classList.add("show");
    els.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const scroller = els.popup.querySelector(".popup-scroll");
    if (scroller) scroller.scrollTop = 0;
}
function closePopup() {
    els.overlay.classList.remove("show");
    els.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}
function verifyAnother() {
    closePopup();
    els.input.value = "";
    state.result = null;
    setTimeout(() => els.input.focus(), 250);
}

/* ---------- sharing ---------- */
function buildShareMessage(withLink) {
    const r = state.result;
    if (!r || r.kind !== "success") return "";
    const d = r.data, B = CONFIG.BRAND, C = CONFIG.CONTACT, L = state.lang;
    const sep = "━━━━━━━━━━━━━━━━━━";
    const lines = [
        `✅ ${B.name} — ${t("shAuth")}`,
        t("shLead"),
        "",
        `📦 ${t("infoName")}: ${d.product_name ?? "—"}`,
        `🔖 ${t("infoId")}: ${d.product_id ?? "—"}`,
        `🏷️ ${t("infoBatch")}: ${d.batch_no ?? "—"}`,
        `📅 ${t("infoMfg")}: ${fmtDate(d.mfg_date)}`,
        `⏳ ${t("infoExp")}: ${fmtDate(d.exp_date)}`
    ];
    lines.push(
        "", sep,
        `🌿 ${B.name} — ${B.slogan[L] || B.slogan.bn}`,
        `🌐 ${C.website}`,
        `📞 ${C.phones.join(" | ")}`,
        `✉️ ${C.email}`,
        `💬 WhatsApp: https://wa.me/${C.whatsapp}`,
        `📘 facebook.com/${C.facebook}`,
        `📍 ${C.address[L] || C.address.bn}`,
        sep
    );
    if (withLink) lines.push(`🔍 ${t("shCheck")}: ${shareUrl()}`);
    return lines.join("\n");
}

async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* fall through */ }
    try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
    } catch (e) { return false; }
}

function shareResult(platform) {
    if (!state.result || state.result.kind !== "success") return;
    const withLink = buildShareMessage(true);
    const url = shareUrl();

    if (platform === "whatsapp") {
        window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(withLink), "_blank", "noopener");
    } else if (platform === "telegram") {
        window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(buildShareMessage(false)), "_blank", "noopener");
    } else if (platform === "messenger") {
        // Messenger cannot receive pre-filled text, so the full message is copied for pasting.
        copyText(withLink).then(() => showToast(t("copiedMessenger")));
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = "fb-messenger://share/?link=" + encodeURIComponent(url);
        } else {
            window.open("https://www.messenger.com/", "_blank", "noopener");
        }
    }
}

async function copyShareMessage() {
    const ok = await copyText(buildShareMessage(true));
    showToast(ok ? t("copied") : "⚠️");
}

async function nativeShare() {
    try {
        await navigator.share({ title: `${CONFIG.BRAND.name} — ${t("shAuth")}`, text: buildShareMessage(false), url: shareUrl() });
    } catch (e) { /* user cancelled */ }
}

/* ---------- ambient particles ---------- */
function spawnDust() {
    const box = $("dust");
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < CONFIG.DUST_PARTICLES; i++) {
        const p = document.createElement("i");
        const size = 3 + Math.random() * 6;
        p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${9 + Math.random() * 12}s;animation-delay:${-Math.random() * 18}s;`;
        box.appendChild(p);
    }
}

/* ---------- init ---------- */
function init() {
    try { const saved = localStorage.getItem("sushoma_lang"); if (saved === "bn" || saved === "en") state.lang = saved; } catch (e) { /* ignore */ }

    document.querySelectorAll("[data-site-link]").forEach((a) => { a.href = CONFIG.SITE_URL; });
    spawnDust();
    applyLanguage();

    els.form.addEventListener("submit", (e) => { e.preventDefault(); verifyProduct(); });
    els.input.addEventListener("input", () => setFieldError(""));
    els.overlay.addEventListener("click", (e) => { if (e.target === els.overlay) closePopup(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopup(); });

    $("langBtn").addEventListener("click", toggleLanguage);
    $("popupClose").addEventListener("click", closePopup);
    $("anotherBtn").addEventListener("click", verifyAnother);
    $("shareWhatsapp").addEventListener("click", () => shareResult("whatsapp"));
    $("shareMessenger").addEventListener("click", () => shareResult("messenger"));
    $("shareTelegram").addEventListener("click", () => shareResult("telegram"));
    $("copyBtn").addEventListener("click", copyShareMessage);
    els.nativeShareBtn.addEventListener("click", nativeShare);

    // QR-code friendly: index.html?id=SH-2026-000001
    if (CONFIG.AUTO_VERIFY_FROM_URL) {
        const qs = new URLSearchParams(location.search);
        const qid = qs.get("id") || qs.get("product_id");
        if (qid) { els.input.value = normalizeId(qid); setTimeout(verifyProduct, 450); }
    }
}

init();
