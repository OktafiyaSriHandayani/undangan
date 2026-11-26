
// =============================
// SUPABASE
// =============================

const SUPABASE_URL = "https://tibzebrbhylirjuoslga.supabase.co";
const SUPABASE_KEY = "sb_publishable_GJEgx3m3FEovFgJ4hZQdLg_UO4LPzkB";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// =============================
// DATA UNDANGAN
// =============================

const weddingDate = new Date("2026-12-12T08:00:00");

const whatsappNumber = "6281234567890";

const weddingLocation = "Gedung Pernikahan, Alamat Lengkap";


// =============================
// NAMA TAMU DARI URL
// =============================

const params = new URLSearchParams(window.location.search);
const guest = params.get("to");

if (guest) {
    document.getElementById("guestName").textContent = guest;
    document.getElementById("rsvpName").value = guest;
}


// =============================
// BUKA UNDANGAN
// =============================

function openInvitation() {
    const cover = document.getElementById("cover");
    const mainApp = document.getElementById("mainApp");
    const music = document.getElementById("weddingMusic");

    cover.style.transition = "opacity 0.8s ease";
    cover.style.opacity = "0";

    setTimeout(() => {
        cover.classList.add("hidden");
        mainApp.classList.remove("hidden");

        showPage("home");

        music.play().then(() => {
            document.getElementById("musicButton").textContent = "♫";
        }).catch(() => {
            document.getElementById("musicButton").textContent = "♫";
        });

    }, 800);
}


// =============================
// PINDAH HALAMAN
// =============================

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");
    const navItems = document.querySelectorAll(".nav-item");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    const targetPage = document.getElementById(pageId);

    if (!targetPage) return;

    targetPage.classList.add("active");

    const selectedButton = document.querySelector(
        `.nav-item[data-page="${pageId}"]`
    );

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Tombol navigasi

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        const pageId = button.dataset.page;

        showPage(pageId);

    });

});


// =============================
// COUNTDOWN
// =============================

function updateCountdown() {

    const now = new Date();
    const distance = weddingDate - now;

    if (distance <= 0) {

        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";

        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
        (distance / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (distance / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (distance / 1000) % 60
    );

    document.getElementById("days").textContent =
        String(days).padStart(2, "0");

    document.getElementById("hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");
}

updateCountdown();

setInterval(updateCountdown, 1000);


// =============================
// MUSIK
// =============================

function toggleMusic() {

    const music = document.getElementById("weddingMusic");
    const button = document.getElementById("musicButton");

    if (music.paused) {

        music.play();

        button.textContent = "♫";

    } else {

        music.pause();

        button.textContent = "♪";
    }
}


// =============================
// COPY REKENING
// =============================

function copyAccount() {

    const account = document.getElementById("accountNumber").textContent;

    navigator.clipboard.writeText(account)
        .then(() => {
            alert("Nomor rekening berhasil disalin!");
        })
        .catch(() => {
            alert("Tidak dapat menyalin nomor rekening.");
        });
}


// =============================
// BUKA ALAMAT KADO
// =============================

function revealAddress() {

    const address = document.getElementById("giftAddress");

    address.classList.toggle("hidden");

}


// =============================
// RSVP
// =============================

document.getElementById("rsvpForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const submitBtn = this.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";

        const name       = document.getElementById("rsvpName").value.trim();
        const attendance = document.getElementById("attendance").value;
        const count      = parseInt(document.getElementById("guestCount").value) || 1;
        const message    = document.getElementById("message").value.trim();

        const { error } = await db
            .from("rsvp")
            .insert({
                nama        : name,
                kehadiran   : attendance,
                jumlah_tamu : count,
                ucapan      : message || null
            });

        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim Konfirmasi";

        if (error) {
            console.error("Supabase RSVP error:", error);
            alert("Gagal mengirim, coba lagi.");
            return;
        }

        alert("Terima kasih " + name + "! Konfirmasi berhasil dikirim. \uD83C\uDF3C");

        this.reset();

        if (guest) {
            document.getElementById("rsvpName").value = guest;
        }

        loadUcapan();
    }
);


// =============================
// LOAD UCAPAN TAMU
// =============================

async function loadUcapan() {

    const container = document.getElementById("ucapanList");
    if (!container) return;

    const { data, error } = await db
        .from("rsvp")
        .select("nama, kehadiran, ucapan, created_at")
        .not("ucapan", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error || !data || data.length === 0) {
        container.innerHTML = "<p class='no-ucapan'>Belum ada ucapan.</p>";
        return;
    }

    container.innerHTML = data.map(r => `
        <div class="ucapan-item">
            <div class="ucapan-header">
                <span class="ucapan-nama">${r.nama}</span>
                <span class="ucapan-status ${r.kehadiran === 'Hadir' ? 'hadir' : 'tidak-hadir'}">
                    ${r.kehadiran === 'Hadir' ? '\u2713 Hadir' : '\u2717 Tidak Hadir'}
                </span>
            </div>
            <p class="ucapan-teks">"${r.ucapan}"</p>
        </div>
    `).join("");
}

loadUcapan();


// =============================
// WHATSAPP
// =============================

function contactWhatsApp(event) {

    event.preventDefault();

    const text = encodeURIComponent(
        "Halo, saya ingin menghubungi terkait undangan pernikahan Aulia & Fajar."
    );

    const link = `https://wa.me/${whatsappNumber}?text=${text}`;

    window.open(link, "_blank");
}


// =============================
// SAVE TO CALENDAR
// =============================

function saveCalendar() {

    const start = "20261212T080000";
    const end = "20261212T140000";

    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "DTSTART:" + start,
        "DTEND:" + end,
        "SUMMARY:Wedding Aulia & Fajar",
        "LOCATION:" + weddingLocation,
        "DESCRIPTION:Undangan pernikahan Aulia & Fajar",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], {
        type: "text/calendar"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "wedding-aulia-fajar.ics";

    link.click();

    URL.revokeObjectURL(url);
}
