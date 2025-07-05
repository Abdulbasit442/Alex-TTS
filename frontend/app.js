// ✅ This is your updated app.js logic for the Alex-TTS frontend
// Includes: User profile management, character tracking, profile picture support, and voice generation

const user = JSON.parse(localStorage.getItem('user'));
if (!user) location.href = 'index.html';

// Keys
const charKey = `charUsed_${user.email}`;
const premiumKey = `isPremium_${user.email}`;
const expiryKey = `expiry_${user.email}`;
const planKey = `plan_${user.email}`;
const picKey = `profilePic_${user.email}`;

let charUsed = parseInt(localStorage.getItem(charKey)) || 0;
const isPremium = isSubscribed();

// DOM Elements
const premiumBadge = document.getElementById('premiumBadge');
const welcomeUser = document.getElementById('welcomeUser');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const charUsedDisplay = document.getElementById('charUsed');
const profileImage = document.getElementById("profileImage");

// Init user info
if (isPremium) premiumBadge.innerHTML = '<span class="premium-badge">PREMIUM</span>';
welcomeUser.innerText = user.name || user.email;
profileName.innerText = user.name || 'Anonymous';
profileEmail.innerText = user.email;
charUsedDisplay.innerText = isPremium ? `Unlimited (${getRemainingDays()}d left)` : charUsed;

const storedImage = localStorage.getItem(picKey);
if (storedImage && profileImage) profileImage.src = storedImage;

// Subscription helpers
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

// Upload profile picture
function handleImageUpload() {
  const file = document.getElementById('uploadImage').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    profileImage.src = e.target.result;
    localStorage.setItem(picKey, e.target.result);
  };
  reader.readAsDataURL(file);
}

// Edit user info (name/email)
function editField(field) {
  const current = field === 'name' ? user.name : user.email;
  const input = prompt(`Enter new ${field}:`, current);
  if (!input) return;

  if (field === 'name') {
    user.name = input;
    localStorage.setItem('user', JSON.stringify(user));
    profileName.innerText = input;
    welcomeUser.innerText = input;
  } else if (field === 'email') {
    const oldChar = localStorage.getItem(charKey);
    const oldPic = localStorage.getItem(picKey);

    user.email = input;
    localStorage.setItem('user', JSON.stringify(user));
    profileEmail.innerText = input;

    localStorage.setItem(`charUsed_${user.email}`, oldChar);
    localStorage.setItem(`profilePic_${user.email}`, oldPic);
  }
}

// Logout
function logout() {
  localStorage.removeItem('user');
  location.href = 'index.html';
}

// Preview voice
function previewVoice() {
  const voice = document.getElementById('voiceSelect').value;
  const audio = document.getElementById('audioPlayer');
  audio.src = `/samples/${voice}.mp3`;
  audio.play();
  document.getElementById('statusMessage').innerText = '▶️ Previewing...';
}

// Generate speech
function generateSpeech() {
  const text = document.getElementById('ttsInput').value;
  const voiceId = document.getElementById('voiceSelect').value;
  const length = text.length;

  if (!isPremium && charUsed + length > 1000) {
    document.getElementById('subscriptionModal').classList.add('show');
    return;
  }

  charUsed += length;
  localStorage.setItem(charKey, charUsed);
  charUsedDisplay.innerText = isPremium ? `Unlimited (${getRemainingDays()}d left)` : charUsed;

  generateRealTTS(text, voiceId);
}

// Connect to backend for real TTS
async function generateRealTTS(text, voice_id) {
  const status = document.getElementById('statusMessage');
  const audio = document.getElementById('audioPlayer');

  status.innerText = '⏳ Generating...';

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

    document.getElementById('downloadBtn').href = audioURL;
    document.getElementById('whatsappShare').href = `https://wa.me/?text=${audioURL}`;
    document.getElementById('facebookShare').href = `https://facebook.com/sharer/sharer.php?u=${audioURL}`;
    document.getElementById('zangiShare').href = `https://zangi.com/share?url=${audioURL}`;
    document.getElementById('snapchatShare').href = `https://snapchat.com/scan?url=${audioURL}`;
    document.getElementById('tiktokShare').href = `https://tiktok.com/upload?url=${audioURL}`;
    document.getElementById('shareButtons').style.display = 'block';

    status.innerText = '✅ Voice Ready!';
    saveToHistory(text, audioURL);
  } catch (err) {
    console.error(err);
    status.innerText = '❌ Failed to generate voice.';
  }
}

function saveToHistory(text, url) {
  const li = document.createElement('li');
  li.innerHTML = `${text.slice(0, 50)}... <a href="${url}" target="_blank">Play</a>`;
  document.getElementById('historyList').prepend(li);
}

function toggleProfile() {
  document.getElementById('profileModal').classList.toggle('show');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function setSubscription(plan, days) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  localStorage.setItem(premiumKey, 'true');
  localStorage.setItem(planKey, plan);
  localStorage.setItem(expiryKey, expiry.toISOString());
}

function subscribePlan(plan) {
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
    amount: amount,
    currency: 'NGN',
    ref: 'SUB_' + Math.floor(Math.random() * 1000000000),
    callback: function () {
      setSubscription(plan, days);
      alert("✅ Subscription Successful!");
      location.reload();
    },
    onClose: function () {
      alert("❌ Payment cancelled.");
    }
  }).openIframe();
}
