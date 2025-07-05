// app.js

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return (location.href = "index.html");

  const charKey = `charUsed_${user.email}`;
  const premiumKey = `isPremium_${user.email}`;
  const expiryKey = `expiry_${user.email}`;
  const planKey = `plan_${user.email}`;

  let charUsed = parseInt(localStorage.getItem(charKey)) || 0;
  const isPremium = isSubscribed();

  const welcomeUser = document.getElementById("welcomeUser");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const charUsedDisplay = document.getElementById("charUsed");
  const premiumBadge = document.getElementById("premiumBadge");

  welcomeUser.innerText = user.name || user.email;
  profileName.innerText = user.name || "Anonymous";
  profileEmail.innerText = user.email;
  charUsedDisplay.innerText = isPremium ? `Unlimited (${getRemainingDays()}d left)` : charUsed;

  if (isPremium) {
    premiumBadge.innerHTML = '<span class="premium-badge">PREMIUM</span>';
  }

  window.logout = () => {
    // localStorage.removeItem("user");
    location.href = "index.html";
  };

  window.toggleProfile = () => {
    document.getElementById("profileModal").classList.toggle("show");
  };

  window.toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  window.closeModal = (id) => {
    document.getElementById(id).classList.remove("show");
  };

  window.previewVoice = () => {
    const voice = document.getElementById("voiceSelect").value;
    const audio = document.getElementById("audioPlayer");
    audio.src = `/samples/${voice}.mp3`;
    audio.play();
    updateStatus("▶️ Previewing...");
  };

  window.generateSpeech = () => {
    const text = document.getElementById("ttsInput").value;
    const voiceId = document.getElementById("voiceSelect").value;
    const length = text.length;

    if (!isPremium && charUsed + length > 1000) {
      document.getElementById("subscriptionModal").classList.add("show");
      return;
    }

    charUsed += length;
    localStorage.setItem(charKey, charUsed);
    charUsedDisplay.innerText = isPremium ? `Unlimited (${getRemainingDays()}d left)` : charUsed;

    generateRealTTS(text, voiceId);
  };

 async function generateRealTTS(text, voice_id) {
  const status = document.getElementById('statusMessage');
  const audio = document.getElementById('audioPlayer');
  const shareSection = document.getElementById('shareButtons');

  status.innerText = '⏳ Generating...';
  shareSection.style.display = 'none'; // Hide share buttons

  try {
    const response = await fetch('http://localhost:5000/api/tts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_id })
    });

    if (!response.ok) throw new Error('Failed to fetch audio');

    const blob = await response.blob();
    const audioURL = URL.createObjectURL(blob);

    audio.src = audioURL;
    audio.play();

    // ✅ Show only after success
    document.getElementById('downloadBtn').href = audioURL;
    document.getElementById('whatsappShare').href = `https://wa.me/?text=${audioURL}`;
    document.getElementById('facebookShare').href = `https://facebook.com/sharer/sharer.php?u=${audioURL}`;
    document.getElementById('zangiShare').href = `https://zangi.com/share?url=${audioURL}`;
    document.getElementById('snapchatShare').href = `https://snapchat.com/scan?url=${audioURL}`;
    document.getElementById('tiktokShare').href = `https://tiktok.com/upload?url=${audioURL}`;
    
    shareSection.style.display = 'block'; // ✅ Show share buttons now
    status.innerText = '✅ Voice Ready!';
    saveToHistory(text, audioURL);
  } catch (err) {
    console.error(err);
    status.innerText = '❌ Failed to generate voice.';
  }
}


  function saveToHistory(text, url) {
    const li = document.createElement("li");
    li.innerHTML = `${text.slice(0, 50)}... <a href="${url}" target="_blank">Play</a>`;
    document.getElementById("historyList").prepend(li);
  }

  function updateStatus(msg) {
    document.getElementById("statusMessage").innerText = msg;
  }

  function isSubscribed() {
    const expiry = localStorage.getItem(expiryKey);
    return expiry && new Date() < new Date(expiry);
  }

  function getRemainingDays() {
    const expiry = localStorage.getItem(expiryKey);
    if (!expiry) return 0;
    const now = new Date();
    const end = new Date(expiry);
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  function setSubscription(plan, days) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    localStorage.setItem(premiumKey, 'true');
    localStorage.setItem(planKey, plan);
    localStorage.setItem(expiryKey, expiry.toISOString());
  }

  window.subscribePlan = (plan) => {
    let amount, days;

    if (plan === 'weekly') {
      amount = 850000; days = 7;
    } else if (plan === 'monthly') {
      amount = 3500000; days = 30;
    } else if (plan === 'yearly') {
      amount = 23500000; days = 365;
    } else {
      alert("Invalid plan"); return;
    }

    PaystackPop.setup({
      key: 'pk_test_ddcc9efeee30993f4d2493859369c9c4b1dec86b',
      email: user.email,
      amount,
      currency: 'NGN',
      ref: 'SUB_' + Math.floor(Math.random() * 1000000000),
      callback: () => {
        setSubscription(plan, days);
        alert("✅ Subscription Successful!");
        location.reload();
      },
      onClose: () => alert("❌ Payment cancelled.")
    }).openIframe();
  };
});
