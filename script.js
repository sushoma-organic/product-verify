// ============================================
// SUSHOMA ULTRA-LUXURY SYSTEM
// ============================================

const API_URL = "https://script.google.com/macros/s/AKfycbz1KEXA9J9rabKCHKiv6GkUQniD6D_xSnyDvJB2JzMSSpJgp20XtFgJq2wE-pZGE4hr/exec";

const productIdInput = document.getElementById("productId");
const verifyBtn = document.getElementById("verifyBtn");
const btnText = document.getElementById("btnText");

const popupOverlay = document.getElementById("popupOverlay");
const popup = document.getElementById("popup");
const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const productInfo = document.getElementById("productInfo");
const shareSection = document.getElementById("shareSection");

let currentLang = 'bn'; 
let lastVerifiedData = null;

// ============================================
// LANGUAGE TOGGLE FUNCTION
// ============================================
function toggleLanguage() {
    currentLang = currentLang === 'bn' ? 'en' : 'bn';
    const elements = document.querySelectorAll('[data-bn]');
    
    elements.forEach(el => {
        if (currentLang === 'en') {
            el.textContent = el.getAttribute('data-en');
            if(el.tagName === 'INPUT') el.placeholder = "e.g. SH-2026-000001";
        } else {
            el.textContent = el.getAttribute('data-bn');
            if(el.tagName === 'INPUT') el.placeholder = "যেমন: SH-2026-000001";
        }
    });
}

// ============================================
// VERIFY PRODUCT (JSONP)
// ============================================
function verifyProduct() {
    const productId = productIdInput.value.trim();

    if (!productId) {
        productIdInput.focus();
        alert(currentLang === 'en' ? "Please enter your Product ID." : "অনুগ্রহ করে আপনার প্রোডাক্ট আইডি লিখুন।");
        return;
    }

    setLoading(true);
    const callbackName = "sushomaCallback_" + Date.now();

    window[callbackName] = function(data) {
        try {
            handleVerificationResponse(data);
        } finally {
            setLoading(false);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }
    };

    const script = document.createElement("script");
    script.src = API_URL + "?id=" + encodeURIComponent(productId) + "&callback=" + encodeURIComponent(callbackName) + "&_=" + Date.now();

    script.onerror = function() {
        setLoading(false);
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);

        showFailed(
            "⚠️ Verification Error",
            currentLang === 'en' ? "Could not verify product right now. Please try again later." : "এই মুহূর্তে পণ্যটি যাচাই করা সম্ভব হচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
        );
    };

    document.body.appendChild(script);
}

// ============================================
// HANDLE API RESPONSE
// ============================================
function handleVerificationResponse(data) {
    if (data && data.success === true) {
        if (String(data.status).trim().toLowerCase() === "authentic") {
            lastVerifiedData = data;
            showSuccess(data);
        } else {
            showFailed(
                currentLang === 'en' ? "⚠️ Product Not Verified" : "⚠️ পণ্যটি যাচাই করা যায়নি",
                currentLang === 'en' ? "Authentic status of this product could not be confirmed." : "উক্ত পণ্যটির Authentic status নিশ্চিত করা যায়নি।"
            );
        }
    } else {
        showFailed(
            currentLang === 'en' ? "⚠️ Product Not Found" : "⚠️ পণ্যটি পাওয়া যায়নি",
            currentLang === 'en' ? "This product was not found in our database." : "উক্ত পণ্যটি আমাদের ডাটাবেজে পাওয়া যায়নি।"
        );
    }
}

// ============================================
// SUCCESS POPUP & LUXURY CONFETTI
// ============================================
function showSuccess(data) {
    popup.className = "popup success";
    popupIcon.textContent = "✓";
    popupTitle.textContent = currentLang === 'en' ? "Authentic & Genuine" : "আসল ও পরীক্ষিত পণ্য";
    
    popupMessage.innerHTML = currentLang === 'en' ? `
        <strong>Your item is an official SUSHOMA masterpiece.</strong><br><br>
        Verified secure through our luxury vault database.<br><br>
        🌿 Stay blessed with nature.
    ` : `
        <strong>আপনার যাচাইকৃত পণ্যটি SUSHOMA-এর ১০০% আসল ও বিশুদ্ধ পণ্য।</strong><br><br>
        আমাদের অফিসিয়াল লাক্সারি ডাটাবেজ দ্বারা এটি সফলভাবে ভেরিফাই করা হয়েছে।<br><br>
        🌿 সুষমার সঙ্গে থাকুন।
    `;

    productInfo.innerHTML = `
        <div class="info-row"><span class="info-label">Product Name</span><span class="info-value">${escapeHTML(data.product_name)}</span></div>
        <div class="info-row"><span class="info-label">Product ID</span><span class="info-value">${escapeHTML(data.product_id)}</span></div>
        <div class="info-row"><span class="info-label">Batch No</span><span class="info-value">${escapeHTML(data.batch_no)}</span></div>
        <div class="info-row"><span class="info-label">MFG Date</span><span class="info-value">${escapeHTML(data.mfg_date)}</span></div>
        <div class="info-row"><span class="info-label">EXP Date</span><span class="info-value">${escapeHTML(data.exp_date)}</span></div>
    `;

    productInfo.classList.add("show");
    shareSection.style.display = "block";
    openPopup();

    // Luxury Golden Confetti Burst
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#d4af37', '#f3e5ab', '#08734d', '#ffffff']
        });
    }
}

// ============================================
// FAILED POPUP
// ============================================
function showFailed(title, message) {
    popup.className = "popup failed";
    popupIcon.textContent = "✕";
    popupTitle.textContent = title;
    
    popupMessage.innerHTML = `
        ${message}<br><br>
        ${currentLang === 'en' ? 'To prevent counterfeiting, always purchase directly from our official channels.' : 'নকল ও প্রতারণা এড়াতে সর্বদা আমাদের অফিসিয়াল ওয়েবসাইট থেকে পণ্য সংগ্রহ করুন।'}<br><br>
        <strong>${currentLang === 'en' ? 'Your security is our highest priority.' : 'আপনার আস্থাই আমাদের সবচেয়ে বড় অর্জন।'}</strong><br><br>
        🌿 SUSHOMA
    `;

    productInfo.classList.remove("show");
    productInfo.innerHTML = "";
    shareSection.style.display = "none";
    openPopup();
}

// ============================================
// SOCIAL SHARE FUNCTION
// ============================================
function shareResult(platform) {
    if (!lastVerifiedData) return;
    const text = `I just verified my SUSHOMA product! It's 100% Genuine & Authentic. Product ID: ${lastVerifiedData.product_id} (${lastVerifiedData.product_name}). Check yours here: ${window.location.href}`;
    const encodedText = encodeURIComponent(text);

    let url = "";
    if (platform === 'whatsapp') {
        url = `https://api.whatsapp.com/send?text=${encodedText}`;
    } else if (platform === 'messenger') {
        url = `fb-messenger://share/?link=${encodeURIComponent(window.location.href)}`;
    } else if (platform === 'telegram') {
        url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`;
    }
    window.open(url, '_blank');
}

// ============================================
// POPUP & LOADING HELPERS
// ============================================
function openPopup() { popupOverlay.classList.add("show"); }
function closePopup() { popupOverlay.classList.remove("show"); }

function setLoading(isLoading) {
    if (isLoading) {
        verifyBtn.disabled = true;
        verifyBtn.classList.add("loading");
        btnText.textContent = currentLang === 'en' ? "Verifying Vault..." : "যাচাই করা হচ্ছে...";
    } else {
        verifyBtn.disabled = false;
        verifyBtn.classList.remove("loading");
        btnText.textContent = currentLang === 'en' ? "Verify Authenticity" : "সত্যতা যাচাই করুন";
    }
}

productIdInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") { verifyProduct(); }
});

popupOverlay.addEventListener("click", function(event) {
    if (event.target === popupOverlay) { closePopup(); }
});

function escapeHTML(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}