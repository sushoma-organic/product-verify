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
        wideLogo: "logo-long.png?v=3",             // LONG / horizontal logo — front page + popup ("" = don't use)
        slogan: {
            bn: "চুলের যত্নে প্রকৃতির ছোঁয়া",
            en: "Nature's Touch for Healthy Hair"
        }
    },

    SITE_URL: "https://sushoma.com",       // "Back to main website" button goes here
    VERIFY_PAGE_URL: "https://sushoma-organic.github.io/product-verify/",                   // link shared with the message. Empty = this page's own URL

    CONTACT: {
        website: "https://sushoma.com",
        email: "care@sushoma.com",
        phones: ["01911199262", "01718019568"], // first number = hotline (used in fail popup & WhatsApp)
        whatsapp: "8801911199262",
        messenger: "sushoma.haircare",
        facebook: "sushoma.haircare",
        address: {
            bn: "ইছাকাঠি, কাশিপুর, বরিশাল-৮২০০",
            en: "Ichakathi, Kashipur, Barishal-8200"
        }
    },

    // Product ID format: XX-XX-XXXX (letters or numbers). Users may type it
    // with or without dashes — it is formatted automatically before lookup.
    ID_GROUPS: [2, 2, 4],
    MASK_MOBILE: true,        // true = hide the middle 2 digits: 01712-XX-5678

    // Membership card policy (corner button on the main page). Edit rules here;
    // text inside <b>…</b> is highlighted.
    MEMBERSHIP: {
        show: true,
        rules: {
            bn: [
                "প্রতিবার পারচেজে একজন গ্রাহক একটি কার্ড পাবেন।",
                "২টি কার্ড থাকলে একটি পারচেজে <b>৫০% ডিসকাউন্ট</b> পাবেন।",
                "২টি অর্ডার একই <b>নাম ও মোবাইল নম্বর</b> থেকে হতে হবে।",
                "একটি কার্ড শুধুমাত্র <b>একবারই</b> ব্যবহার করা যাবে।",
                "প্রতিটি কার্ডের মেয়াদ অর্ডার করার পর থেকে <b>৬ মাস</b>।",
                "<b>ডেলিভারি চার্জেও ৫০% ডিসকাউন্ট</b> প্রযোজ্য হবে।",
                "এই ডিসকাউন্ট শুধুমাত্র <b>সিঙ্গেল পিস পারচেজের</b> ক্ষেত্রে প্রযোজ্য।",
                "একটি পারচেজে সর্বোচ্চ <b>১টি ডিসকাউন্ট</b> উপভোগ করা যাবে।"
            ],
            en: [
                "A customer receives one card with every purchase.",
                "With 2 cards you get a <b>50% discount</b> on one purchase.",
                "Both orders must be under the same <b>name and mobile number</b>.",
                "Each card can be used <b>only once</b>.",
                "Each card is valid for <b>6 months</b> from the order date.",
                "The <b>50% discount also applies to the delivery charge</b>.",
                "This discount applies to <b>single-piece purchases</b> only.",
                "A maximum of <b>1 discount</b> can be used per purchase."
            ]
        }
    },

    TIMEOUT_MS: 12000,        // API wait time (per method)
    AUTO_VERIFY_FROM_URL: true, // QR link like  /index.html?id=SH-2026-000001  verifies automatically
    CONFETTI: true,
    DUST_PARTICLES: 12
};

/* ==========================================================================
   2. TRANSLATIONS
   ========================================================================== */
const I18N = {
    bn: {
        back: "মূল ওয়েবসাইট",
        langSwitch: "English",
        badge: "অফিসিয়াল অথেনটিকেশন",
        trust1: "বিএসটিআই মানোত্তীর্ণ পণ্য",
        trust2: "১০০% প্রাকৃতিক ও কেমিক্যাল মুক্ত",
        trust3: "সিকিউর ডিজিটাল ভেরিফিকেশন",
        stat1n: "৪৪+", stat1: "ভেষজ উপাদান",
        stat2n: "৮", stat2: "প্রকার তেল",
        stat3n: "৬৪", stat3: "জেলায় ডেলিভারি",
        howTitle: "কীভাবে যাচাই করবেন",
        step1: "বোতল বা প্যাকেটের লেবেলে থাকা প্রোডাক্ট আইডি খুঁজে নিন।",
        step2: "আইডিটি বক্সে লিখুন — ড্যাশ (-) ছাড়াও লিখতে পারেন।",
        step3: "যাচাই বাটনে চাপুন, সাথে সাথে পণ্যের তথ্য দেখুন।",
        authFoot1: "100% ORGANIC", authFoot2: "NATURAL HAIR CARE OIL",
        warnTitle: "নকল থেকে সাবধান",
        warnText: "আইডি না মিললে পণ্যটি ব্যবহার করবেন না, সরাসরি আমাদের হটলাইনে জানান।",
        mtKicker: "প্রিমিয়াম মেম্বারশিপ",
        mtTop: "২টি কার্ড থাকলেই",
        mtBottom: "ডিসকাউন্ট",
        mtLink: "নীতিমালা দেখুন",
        title: "পণ্যের সত্যতা যাচাই",
        subtitle: "আপনার সুষমা পণ্যটি ১০০% আসল কি না নিশ্চিত হতে নিচের বক্সে প্রোডাক্ট আইডি লিখুন।",
        label: "সিকিউর প্রোডাক্ট আইডি",
        placeholder: "ফরম্যাট: XX-XX-XXXX",
        verifyBtn: "সত্যতা যাচাই করুন",
        verifying: "যাচাই করা হচ্ছে...",
        contactHeader: "সরাসরি যোগাযোগ",
        cWebsite: "ওয়েবসাইট",
        cHotline: "হটলাইন",
        goSite: "মূল ওয়েবসাইটে ফিরে যান",
        visitSite: "ওয়েবসাইট ভিজিট করুন",
        footer: "সুষমা সিকিউর ভল্ট",
        errEmpty: "অনুগ্রহ করে আপনার প্রোডাক্ট আইডি লিখুন।",
        errFormat: "সঠিক ফরম্যাটে আইডি লিখুন: XX-XX-XXXX (মোট ৮টি অক্ষর/সংখ্যা)",

        okTitle: "আসল ও পরীক্ষিত পণ্য",
        okMsg: "<strong>আপনার যাচাইকৃত পণ্যটি SUSHOMA-এর ১০০% আসল ও বিশুদ্ধ পণ্য।</strong><br>আমাদের অফিসিয়াল ডাটাবেজ দ্বারা এটি সফলভাবে ভেরিফাই করা হয়েছে। 🌿",
        notVerTitle: "পণ্যটি যাচাই করা যায়নি",
        notVerMsg: "উক্ত পণ্যটির Authentic status নিশ্চিত করা যায়নি।",
        notFoundTitle: "পণ্যটি পাওয়া যায়নি",
        notFoundMsg: "উক্ত আইডিটি আমাদের ডাটাবেজে পাওয়া যায়নি। আইডিটি আবার সঠিকভাবে লিখে চেষ্টা করুন।",
        errTitle: "যাচাই করা সম্ভব হয়নি",
        errMsg: "এই মুহূর্তে সংযোগ করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
        failAdvice: "নকল ও প্রতারণা এড়াতে সর্বদা আমাদের অফিসিয়াল চ্যানেল থেকে পণ্য সংগ্রহ করুন। আপনার আস্থাই আমাদের সবচেয়ে বড় অর্জন।",

        infoInvoice: "ইনভয়েস নং",
        infoCustomer: "গ্রাহকের নাম",
        infoMobile: "মোবাইল নম্বর",
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
        callNow: "কল করুন",

        memberBtn: "মেম্বারশিপ কার্ড নীতিমালা",
        memberKicker: "প্রিমিয়াম মেম্বারশিপ কার্ড",
        memberTitle: "মেম্বারশিপ কার্ড নীতিমালা",
        memberSub: "ভবিষ্যতে ডিসকাউন্ট পেতে কার্ডটি সংরক্ষণ করুন",
        memberOfferTop: "২টি কার্ড থাকলেই",
        memberOfferBig: "৫০%",
        memberOfferBottom: "ডিসকাউন্ট",
        memberRulesTitle: "কার্ডের নিয়মাবলী",
        memberWa: "ডিসকাউন্ট পেতে সরাসরি WhatsApp করুন"
    },
    en: {
        back: "Main Website",
        langSwitch: "বাংলা",
        badge: "Official Authentication",
        trust1: "BSTI Certified Product",
        trust2: "100% Natural & Chemical-Free",
        trust3: "Secure Digital Verification",
        stat1n: "44+", stat1: "Herbal ingredients",
        stat2n: "8", stat2: "Oil blend",
        stat3n: "64", stat3: "Districts delivery",
        howTitle: "How to verify",
        step1: "Find the Product ID on the bottle or box label.",
        step2: "Type the ID in the box — dashes (-) are optional.",
        step3: "Tap Verify and see the product details instantly.",
        authFoot1: "100% ORGANIC", authFoot2: "NATURAL HAIR CARE OIL",
        warnTitle: "Beware of counterfeits",
        warnText: "If the ID doesn't match, don't use the product — call our hotline right away.",
        mtKicker: "Premium Membership",
        mtTop: "Have 2 cards, get",
        mtBottom: "discount",
        mtLink: "View policy",
        title: "Product Authentication",
        subtitle: "Enter your secure product ID below to confirm your SUSHOMA product is 100% genuine.",
        label: "Secure Product ID",
        placeholder: "Format: XX-XX-XXXX",
        verifyBtn: "Verify Authenticity",
        verifying: "Verifying...",
        contactHeader: "Direct Concierge",
        cWebsite: "Website",
        cHotline: "Hotline",
        goSite: "Go to Main Website",
        visitSite: "Visit Website",
        footer: "SUSHOMA Secure Vault",
        errEmpty: "Please enter your Product ID.",
        errFormat: "Enter the ID as XX-XX-XXXX (8 letters/numbers in total).",

        okTitle: "Authentic & Genuine",
        okMsg: "<strong>Your item is an official, 100% genuine SUSHOMA product.</strong><br>Successfully verified through our official database. 🌿",
        notVerTitle: "Product Not Verified",
        notVerMsg: "The authentic status of this product could not be confirmed.",
        notFoundTitle: "Product Not Found",
        notFoundMsg: "This ID was not found in our database. Please re-check the ID and try again.",
        errTitle: "Could Not Verify",
        errMsg: "We couldn't connect right now. Please try again in a moment.",
        failAdvice: "To avoid counterfeits, always buy from our official channels. Your trust is our greatest achievement.",

        infoInvoice: "Invoice No",
        infoCustomer: "Customer Name",
        infoMobile: "Mobile Number",
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
        callNow: "Call now",

        memberBtn: "Membership Card Policy",
        memberKicker: "Premium Membership Card",
        memberTitle: "Membership Card Policy",
        memberSub: "Keep your card safe to get a discount in future",
        memberOfferTop: "Have 2 cards and get",
        memberOfferBig: "50%",
        memberOfferBottom: "Discount",
        memberRulesTitle: "Card Rules",
        memberWa: "WhatsApp us directly for your discount"
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
// Make "১০০%" / "100%" stand out so it is easy to read
const pct = (html) => String(html).replace(/([০-৯0-9]+\s?%)/g, '<b class="pct">$1</b>');
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const num = (n) => (state.lang === "bn" ? toBn(n) : String(n));
const compactId = (v) => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const ID_LEN = CONFIG.ID_GROUPS.reduce((a, b) => a + b, 0);
// "ab12cd34" / "AB 12 CD34" / "AB-12-CD34"  ->  "AB-12-CD34"
function formatId(v) {
    const c = compactId(v).slice(0, ID_LEN);
    const parts = [];
    let i = 0;
    for (const g of CONFIG.ID_GROUPS) { if (i >= c.length) break; parts.push(c.slice(i, i + g)); i += g; }
    return parts.join("-");
}
const normalizeId = formatId;
// first non-empty value among several possible Google Sheet column names
const pick = (d, keys) => { for (const k of keys) { if (d && d[k] !== undefined && d[k] !== null && String(d[k]).trim() !== "") return d[k]; } return ""; };
function maskMobile(m) {
    const s = String(m || "");
    if (!CONFIG.MASK_MOBILE || s.length < 9) return s;
    // 01712345678 -> 01712-XX-5678 (only the 2 middle digits hidden)
    return s.slice(0, 5) + "-XX-" + s.slice(7);
}
function readInfo(d) {
    return {
        invoice: pick(d, ["invoice_no", "invoice", "invoice_number", "invoiceNo", "Invoice No"]),
        customer: pick(d, ["customer_name", "customer", "name", "customerName", "Customer Name"]),
        mobile: maskMobile(pick(d, ["mobile", "mobile_number", "mobile_no", "phone", "customer_mobile", "Mobile Number"]))
    };
}
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
    // Long logo: shown on the front page (replaces the text name) and on top of the popup
    document.querySelectorAll("[data-wide-logo]").forEach((w) => {
        if (w.dataset.bound || !B.wideLogo) return;
        w.dataset.bound = "1";
        w.addEventListener("load", () => {
            w.hidden = false;
            const panel = w.closest(".brand-panel");
            if (panel) panel.classList.add("has-wide-logo");
        });
        w.addEventListener("error", () => { w.hidden = true; });
        w.src = B.wideLogo;
    });
}

function contactChip(ic, text, href, external) {
    const ext = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a class="contact-item" href="${esc(href)}"${ext}><span class="c-ico">${icon(ic)}</span><span class="t">${esc(text)}</span></a>`;
}

function renderContact() {
    const C = CONFIG.CONTACT;
    const items = [
        contactChip("globe", hostOf(C.website), C.website, true),
        contactChip("facebook", "Facebook", "https://facebook.com/" + C.facebook, true),
        ...C.phones.map((p) => contactChip("phone", p, "tel:" + p)),
        contactChip("whatsapp", "WhatsApp", "https://wa.me/" + C.whatsapp, true),
        contactChip("messenger", "Messenger", "https://m.me/" + C.messenger, true),
        // Email is last: the odd item spans the full row, so it is never cut off
        contactChip("mail", C.email, "mailto:" + C.email).replace('class="contact-item"', 'class="contact-item full"')
    ];
    els.contactGrid.innerHTML = items.join("");
    els.contactAddress.innerHTML = `${icon("pin")}<span>${esc(C.address[state.lang] || C.address.bn)}</span>`;
}

/* ---------- language ---------- */
function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = pct(esc(t(el.dataset.i18n))); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $("langText").textContent = t("langSwitch");
    renderBrand();
    renderContact();
    renderMembership();
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

/* ---------- verification (JSONP first, fetch as automatic fallback) ---------- */
const noop = function () { /* swallow late JSONP callbacks */ };

function apiUrl(id, cbName) {
    const sep = CONFIG.API_URL.includes("?") ? "&" : "?";
    return `${CONFIG.API_URL}${sep}id=${encodeURIComponent(id)}&callback=${encodeURIComponent(cbName)}&_=${Date.now()}`;
}

// Method 1: classic JSONP <script> tag
function jsonpRequest(id) {
    return new Promise((resolve, reject) => {
        const cbName = "sushomaCb_" + Date.now() + "_" + Math.floor(Math.random() * 1e4);
        const script = document.createElement("script");
        let done = false;

        const end = (fn, arg) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            window[cbName] = noop;
            script.remove();
            fn(arg);
        };
        const timer = setTimeout(() => end(reject, new Error("jsonp-timeout")), CONFIG.TIMEOUT_MS);

        window[cbName] = (data) => end(resolve, data);
        script.onerror = () => end(reject, new Error("jsonp-blocked"));
        script.src = apiUrl(id, cbName);
        document.body.appendChild(script);
    });
}

// Method 2: fetch() — used when a mobile browser / data-saver / blocker stops the <script> tag
async function fetchRequest(id) {
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), CONFIG.TIMEOUT_MS);
    try {
        const res = await fetch(apiUrl(id, "sushomaFetch"), { cache: "no-store", credentials: "omit", signal: ctrl ? ctrl.signal : undefined });
        const text = (await res.text()).trim();
        try { return JSON.parse(text); } catch (e) { /* maybe wrapped like cb({...}) */ }
        const m = text.match(/^[\w.$]+\(([\s\S]*)\)\s*;?$/);
        if (m) return JSON.parse(m[1]);
        throw new Error("bad-response");
    } finally {
        clearTimeout(timer);
    }
}

async function lookup(id) {
    try { return await jsonpRequest(id); }
    catch (e1) {
        try { return await fetchRequest(id); } catch (e2) { return null; }
    }
}

async function verifyProduct() {
    if (state.loading) return;
    const raw = compactId(els.input.value);
    if (!raw) { setFieldError(t("errEmpty")); els.input.focus(); return; }
    if (raw.length !== ID_LEN) { setFieldError(t("errFormat")); els.input.focus(); return; }
    const id = formatId(raw);
    els.input.value = id;
    setFieldError("");
    setLoading(true);

    let data = await lookup(id);
    // Sheet may store the ID without dashes — try that too before giving up
    if (data && data.success !== true) {
        const alt = await lookup(raw);
        if (alt && alt.success === true) data = alt;
    }

    setLoading(false);
    if (data === null) showResult("error");
    else handleResponse(data);
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
        confetti({ particleCount: 130, spread: 80, origin: { y: 0.65 }, colors: ["#1E3F20", "#10b981", "#34d399", "#fef08a", "#ec4899"] });
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
    els.popupMessage.innerHTML = pct(ok ? t("okMsg") : `${t(msgs[r.kind])}<br><br>${t("failAdvice")}`);

    if (ok) {
        const d = r.data;
        els.productInfo.hidden = false;
        const x = readInfo(d);
        els.productInfo.innerHTML = [
            ["infoInvoice", x.invoice],
            ["infoCustomer", x.customer],
            ["infoMobile", x.mobile],
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
        `🧾 ${t("infoInvoice")}: ${readInfo(d).invoice || "—"}`,
        `👤 ${t("infoCustomer")}: ${readInfo(d).customer || "—"}`,
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

/* ---------- membership card policy ---------- */
function renderMembership() {
    const M = CONFIG.MEMBERSHIP;
    const list = $("memberRules");
    if (!M || !list) return;
    const rules = M.rules[state.lang] || M.rules.bn;
    list.innerHTML = rules.map((r, i) => `<li><span class="num">${num(i + 1)}</span><span>${r}</span></li>`).join("");
    const msg = state.lang === "bn" ? "আমার ২টি সুষমা মেম্বারশিপ কার্ড আছে, ডিসকাউন্ট নিতে চাই।" : "I have 2 SUSHOMA membership cards and want my discount.";
    $("memberWa").href = "https://wa.me/" + CONFIG.CONTACT.whatsapp + "?text=" + encodeURIComponent(msg);
}
function openMember() {
    const o = $("memberOverlay");
    o.classList.add("show"); o.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const sc = o.querySelector(".popup-scroll"); if (sc) sc.scrollTop = 0;
}
function closeMember() {
    const o = $("memberOverlay");
    if (!o.classList.contains("show")) return false;
    o.classList.remove("show"); o.setAttribute("aria-hidden", "true");
    if (!els.overlay.classList.contains("show")) document.body.classList.remove("modal-open");
    return true;
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
    els.input.addEventListener("input", () => {
        setFieldError("");
        const f = formatId(els.input.value);
        if (els.input.value !== f) els.input.value = f;
    });
    els.overlay.addEventListener("click", (e) => { if (e.target === els.overlay) closePopup(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !closeMember()) closePopup(); });

    if (CONFIG.MEMBERSHIP && CONFIG.MEMBERSHIP.show) {
        $("memberBtn").addEventListener("click", openMember);
        $("memberTeaser").addEventListener("click", openMember);
        $("memberClose").addEventListener("click", closeMember);
        $("memberOverlay").addEventListener("click", (e) => { if (e.target.id === "memberOverlay") closeMember(); });
    } else {
        $("memberBtn").hidden = true;
        $("memberTeaser").hidden = true;
    }

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
