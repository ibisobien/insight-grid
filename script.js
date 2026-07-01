/* ============================================================
   Insight-Grid registration site
   Talks to a Google Apps Script Web App that reads/writes a
   Google Sheet. See google-apps-script/Code.gs + README.md
   for how to set that up and where to paste the URL below.
   ============================================================ */

const CONFIG = {
  // Paste your deployed Google Apps Script Web App URL here.
  // It looks like: https://script.google.com/macros/s/XXXXXXXX/exec
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzwCJvsJZzEnLH1PYmnHIHFG_IpMAvhKeQSNtZR2htM9YykgLJTumaloF_7Mxm_mmDb/exec",
  LUCKY_SLOTS: 10,
  PRICE_LUCKY: 90000,
  PRICE_STANDARD: 100000
};

document.getElementById("year").textContent = new Date().getFullYear();

const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");

/* ---------------- Lucky-10 tracker ---------------- */

function buildDots(filled, total){
  const wrap = document.getElementById("trackerDots");
  wrap.innerHTML = "";
  for(let i = 0; i < total; i++){
    const d = document.createElement("div");
    d.className = "dot" + (i < filled ? " filled" : "");
    wrap.appendChild(d);
  }
}

function updatePriceUI(count){
  const slotsLeft = Math.max(0, CONFIG.LUCKY_SLOTS - count);
  const isLucky = slotsLeft > 0;

  buildDots(Math.min(count, CONFIG.LUCKY_SLOTS), CONFIG.LUCKY_SLOTS);

  document.getElementById("registeredCount").textContent = count;

  const statusEl = document.getElementById("trackerStatus");
  if(isLucky){
    statusEl.classList.remove("is-full");
    statusEl.innerHTML = `<span class="count-num">${count}</span> people registered · <strong>${slotsLeft} lucky-10 ${slotsLeft === 1 ? "spot" : "spots"} left</strong> at ${naira(CONFIG.PRICE_LUCKY)}`;
  } else {
    statusEl.classList.add("is-full");
    statusEl.innerHTML = `<span class="count-num">${count}</span> people registered · Lucky-10 spots are filled — standard price ${naira(CONFIG.PRICE_STANDARD)} now applies`;
  }

  const priceEl = document.getElementById("dynamicPrice");
  const wasEl = document.getElementById("dynamicWas");
  const captionEl = document.getElementById("priceCaption");

  if(isLucky){
    priceEl.textContent = naira(CONFIG.PRICE_LUCKY);
    wasEl.style.display = "inline";
    wasEl.textContent = naira(CONFIG.PRICE_STANDARD);
    captionEl.textContent = `Lucky-10 price — ${slotsLeft} ${slotsLeft === 1 ? "spot" : "spots"} left, applied automatically.`;
  } else {
    priceEl.textContent = naira(CONFIG.PRICE_STANDARD);
    wasEl.style.display = "none";
    captionEl.textContent = "Standard bundle price — the lucky-10 window has closed.";
  }
}

async function loadCount(){
  if(!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL.startsWith("PASTE_")){
    // No backend connected yet — show a friendly placeholder state.
    document.getElementById("trackerStatus").textContent =
      "Registration count will appear here once the Google Sheet connection is set up.";
    buildDots(0, CONFIG.LUCKY_SLOTS);
    return;
  }
  try{
    const res = await fetch(`${CONFIG.SCRIPT_URL}?action=count`);
    const data = await res.json();
    updatePriceUI(Number(data.count) || 0);
  } catch(err){
    document.getElementById("trackerStatus").textContent =
      "Couldn't load the live count right now — registration still works below.";
    buildDots(0, CONFIG.LUCKY_SLOTS);
  }
}

loadCount();

/* ---------------- Registration form ---------------- */

const form = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("formStatus");

function showStatus(kind, message){
  statusBox.className = "show " + kind;
  statusBox.textContent = message;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if(!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL.startsWith("PASTE_")){
    showStatus("error", "Registration isn't connected to the Google Sheet yet. See README.md to add your Apps Script URL.");
    return;
  }

  const formData = new FormData(form);
  const payload = {
    action: "register",
    fullName: (formData.get("fullName") || "").trim(),
    phone: (formData.get("phone") || "").trim(),
    email: (formData.get("email") || "").trim(),
    bundle: "Excel + Power BI + SQL — Full 3-Month Bundle",
    siwes: formData.get("siwes") || "No",
    notes: (formData.get("notes") || "").trim(),
    timestamp: new Date().toISOString()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";
  showStatus("loading", "Saving your registration…");

  try{
    // Sent as a GET request with query params (not POST) because Apps
    // Script Web Apps can drop POST bodies during their internal
    // redirect, while GET query params survive it reliably.
    //
    // Registration is fired with mode:"no-cors" and does not read the
    // response body. Google's script layer redirects internally, and
    // that redirected response is sometimes unreadable by JS even
    // though the request itself completed and the row was saved —
    // which was showing a false "error" here despite successful saves.
    // Since the save is confirmed reliable, we treat a request that
    // doesn't throw as success and refresh the count separately.
    const url = new URL(CONFIG.SCRIPT_URL);
    Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, value));

    await fetch(url.toString(), { mode: "no-cors" });

    showStatus("success", "You're in! We'll reach out by email or WhatsApp to confirm payment and your batch.");
    form.reset();
    setTimeout(loadCount, 600);
  } catch(err){
    showStatus("error", "Something went wrong saving your registration. Please try again, or reach us on WhatsApp at 0816 364 1496.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit registration";
  }
});
