// ============================================
// SUSHOMA PRODUCT VERIFICATION SYSTEM
// ============================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbx7DaUvx0EShSd6LJwt0dLkkB8DNUe-Pg7n3qfTeYeMzjziK2EL4y3rNlJ5vxuSr20v/exec";


const productIdInput = document.getElementById("productId");
const verifyBtn = document.getElementById("verifyBtn");
const btnText = document.getElementById("btnText");

const popupOverlay = document.getElementById("popupOverlay");
const popup = document.getElementById("popup");

const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const productInfo = document.getElementById("productInfo");


// ============================================
// VERIFY PRODUCT
// ============================================

function verifyProduct() {

    const productId = productIdInput.value.trim();


    if (!productId) {

        productIdInput.focus();

        alert("Please enter your Product ID.");

        return;
    }


    setLoading(true);


    const callbackName =
        "sushomaCallback_" + Date.now();


    window[callbackName] = function(data) {

        try {

            handleVerificationResponse(data);

        }

        finally {

            setLoading(false);

            delete window[callbackName];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }

        }

    };


    const script =
        document.createElement("script");


    script.src =
        API_URL +
        "?id=" +
        encodeURIComponent(productId) +
        "&callback=" +
        encodeURIComponent(callbackName) +
        "&_=" +
        Date.now();


    script.onerror = function() {

        setLoading(false);

        delete window[callbackName];

        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }


        showFailed(
            "⚠️ Verification Error",
            "এই মুহূর্তে পণ্যটি যাচাই করা সম্ভব হচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
        );

    };


    document.body.appendChild(script);

}


// ============================================
// HANDLE API RESPONSE
// ============================================

function handleVerificationResponse(data) {


    if (
        data &&
        data.success === true
    ) {


        if (
            String(data.status)
                .trim()
                .toLowerCase() === "authentic"
        ) {

            showSuccess(data);

        }

        else {

            showFailed(
                "⚠️ পণ্যটি যাচাই করা যায়নি",

                "উক্ত পণ্যটির Authentic status নিশ্চিত করা যায়নি।"
            );

        }

    }

    else {

        showFailed(
            "⚠️ পণ্যটি যাচাই করা যায়নি",

            "উক্ত পণ্যটি আমাদের ডাটাবেজে পাওয়া যায়নি।"
        );

    }

}


// ============================================
// SUCCESS POPUP
// ============================================

function showSuccess(data) {


    popup.className = "popup success";


    popupIcon.textContent = "✓";


    popupTitle.textContent =
        "🎉 Congratulations!!";


    popupMessage.innerHTML = `

        <strong>
            Your Product is Genuine & Authentic.
        </strong>

        <br><br>

        আপনার যাচাইকৃত পণ্যটি SUSHOMA-এর আসল পণ্য।

        <br><br>

        🌿 SUSHOMA-এর সঙ্গে থাকুন।

    `;


    productInfo.innerHTML = `

        <div class="info-row">
            <span class="info-label">
                Product Name
            </span>

            <span class="info-value">
                ${escapeHTML(data.product_name)}
            </span>
        </div>


        <div class="info-row">
            <span class="info-label">
                Product ID
            </span>

            <span class="info-value">
                ${escapeHTML(data.product_id)}
            </span>
        </div>


        <div class="info-row">
            <span class="info-label">
                Batch No
            </span>

            <span class="info-value">
                ${escapeHTML(data.batch_no)}
            </span>
        </div>


        <div class="info-row">
            <span class="info-label">
                MFG Date
            </span>

            <span class="info-value">
                ${escapeHTML(data.mfg_date)}
            </span>
        </div>


        <div class="info-row">
            <span class="info-label">
                EXP Date
            </span>

            <span class="info-value">
                ${escapeHTML(data.exp_date)}
            </span>
        </div>

    `;


    productInfo.classList.add("show");


    openPopup();

}


// ============================================
// FAILED POPUP
// ============================================

function showFailed(title, message) {


    popup.className = "popup failed";


    popupIcon.textContent = "⚠";


    popupTitle.textContent = title;


    popupMessage.innerHTML = `

        ${message}

        <br><br>

        নকল ও প্রতারণা এড়াতে আমাদের অফিসিয়াল
        ওয়েবসাইট ও ভেরিফায়েড ফেসবুক পেজ থেকে
        পণ্য অর্ডার করুন।

        <br><br>

        <strong>
            আপনার নিরাপত্তাই আমাদের অগ্রাধিকার।
        </strong>

        <br><br>

        🌿 SUSHOMA-এর সঙ্গে থাকুন।

    `;


    productInfo.classList.remove("show");

    productInfo.innerHTML = "";


    openPopup();

}


// ============================================
// POPUP
// ============================================

function openPopup() {

    popupOverlay.classList.add("show");

}


function closePopup() {

    popupOverlay.classList.remove("show");

}


// ============================================
// LOADING
// ============================================

function setLoading(isLoading) {


    if (isLoading) {

        verifyBtn.disabled = true;

        verifyBtn.classList.add("loading");

        btnText.textContent =
            "Verifying...";

    }

    else {

        verifyBtn.disabled = false;

        verifyBtn.classList.remove("loading");

        btnText.textContent =
            "Verify Product";

    }

}


// ============================================
// ENTER KEY
// ============================================

productIdInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            verifyProduct();

        }

    }
);


// ============================================
// CLOSE OUTSIDE POPUP
// ============================================

popupOverlay.addEventListener(
    "click",
    function(event) {

        if (event.target === popupOverlay) {

            closePopup();

        }

    }
);


// ============================================
// HTML SECURITY
// ============================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}