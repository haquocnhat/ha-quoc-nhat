

/*
============================================================
🟩 PHẦN 3 — CANVAS #WORLD
⚠️ ĐÂY LÀ HIỆU ỨNG NỀN CỦA HERO
⚠️ KHÔNG XÓA PHẦN NÀY
============================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    /*
    --------------------------------------------------------
    🟩 3.1 — KHỞI TẠO CANVAS
    --------------------------------------------------------
    */

    const hero = document.getElementById("hero");

    const canvas = document.getElementById("world");

    const ctx = canvas.getContext("2d");

    const mouse = {
        x: 0,
        y: 0,
        active: false
    };

    const particles = [];

    const PARTICLE_COUNT = 800;


    /*
    --------------------------------------------------------
    🟩 3.2 — RESIZE + TẠO 800 PARTICLES
    --------------------------------------------------------
    */

    function resize() {

        const rect = hero.getBoundingClientRect();

        canvas.width = rect.width;

        canvas.height = rect.height;

        particles.length = 0;

        for (let i = 0; i < PARTICLE_COUNT; i++) {

            particles.push({

                x: Math.random() * canvas.width,

                y: Math.random() * canvas.height,

                vx: (Math.random() - 0.5) * 0.15,

                vy: (Math.random() - 0.5) * 0.15,

                size: Math.random() * 1.5 + 0.3,

                alpha: Math.random() * 0.5 + 0.2

            });

        }
    }


    /*
    --------------------------------------------------------
    🟩 3.3 — CHUỘT TƯƠNG TÁC VỚI CANVAS
    --------------------------------------------------------
    */

    hero.addEventListener("mousemove", e => {

        const rect = hero.getBoundingClientRect();

        mouse.x = e.clientX - rect.left;

        mouse.y = e.clientY - rect.top;

        mouse.active = true;

    });


    /*
    --------------------------------------------------------
    🟩 3.4 — CHUỘT RỜI KHỎI HERO
    --------------------------------------------------------
    */

    hero.addEventListener("mouseleave", () => {

        mouse.active = false;

    });


    /*
    --------------------------------------------------------
    🟩 3.5 — TỰ ĐỘNG RESIZE KHI ĐỔI KÍCH THƯỚC CỬA SỔ
    --------------------------------------------------------
    */

    window.addEventListener("resize", resize);


    /*
    --------------------------------------------------------
    🟩 3.6 — VÒNG LẶP ANIMATION CỦA CANVAS
    --------------------------------------------------------
    */

    function animate() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        particles.forEach(p => {


            /*
            ------------------------------------------------
            🟩 Chuyển động ngẫu nhiên rất nhẹ
            ------------------------------------------------
            */

            p.vx +=
                (Math.random() - 0.5) * 0.002;

            p.vy +=
                (Math.random() - 0.5) * 0.002;


            /*
            ------------------------------------------------
            🟩 Giảm tốc nhẹ
            ------------------------------------------------
            */

            p.vx *= 0.995;

            p.vy *= 0.995;


            /*
            ------------------------------------------------
            🟩 PARTICLE PHẢN ỨNG VỚI CHUỘT
            ------------------------------------------------
            */

            if (mouse.active) {

                const dx =
                    p.x - mouse.x;

                const dy =
                    p.y - mouse.y;

                const distance =
                    Math.hypot(dx, dy);

                const radius = 180;


                if (
                    distance < radius &&
                    distance > 0
                ) {

                    const force =
                        Math.pow(
                            1 - distance / radius,
                            2
                        ) * 0.5;


                    p.vx +=
                        (dx / distance) * force;

                    p.vy +=
                        (dy / distance) * force;
                }
            }


            /*
            ------------------------------------------------
            🟩 CẬP NHẬT VỊ TRÍ PARTICLE
            ------------------------------------------------
            */

            p.x += p.vx;

            p.y += p.vy;


            /*
            ------------------------------------------------
            🟩 BẬT LẠI KHI CHẠM BIÊN
            ------------------------------------------------
            */

            if (
                p.x < 0 ||
                p.x > canvas.width
            ) {

                p.vx *= -1;

            }


            if (
                p.y < 0 ||
                p.y > canvas.height
            ) {

                p.vy *= -1;

            }


            /*
            ------------------------------------------------
            🟩 GIỮ PARTICLE TRONG CANVAS
            ------------------------------------------------
            */

            p.x = Math.max(
                0,
                Math.min(
                    canvas.width,
                    p.x
                )
            );

            p.y = Math.max(
                0,
                Math.min(
                    canvas.height,
                    p.y
                )
            );


            /*
            ------------------------------------------------
            🟩 VẼ PARTICLE
            ------------------------------------------------
            */

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(
                    255,
                    255,
                    255,
                    ${p.alpha}
                )`;

            ctx.fill();

        });


        /*
        ------------------------------------------------
        🟩 CHẠY FRAME TIẾP THEO
        ------------------------------------------------
        */

        requestAnimationFrame(animate);

    }


    /*
    --------------------------------------------------------
    🟩 3.7 — KHỞI ĐỘNG CANVAS
    --------------------------------------------------------
    */

    resize();

    animate();


    /*
    ========================================================
    🟨 PHẦN 4 — NAVIGATION ACTIVE
    ========================================================
    */

    const navLinks =
        document.querySelectorAll(".nav-link");

    const sections =
        document.querySelectorAll("section[id]");


    /*
    --------------------------------------------------------
    🟨 4.1 — XÁC ĐỊNH SECTION ĐANG XEM
    --------------------------------------------------------
    */

    function updateActiveNav() {

        let current = "hero";


        sections.forEach(section => {

            if (
                section.getBoundingClientRect().top
                <= window.innerHeight * 0.35
            ) {

                current = section.id;

            }

        });


        /*
        ----------------------------------------------------
        🟨 4.2 — ĐỔI TRẠNG THÁI MENU
        ----------------------------------------------------
        */

        navLinks.forEach(link => {

            link.classList.toggle(

                "active",

                link.getAttribute("href")
                === "#" + current

            );

        });

    }


    /*
    --------------------------------------------------------
    🟨 4.3 — CẬP NHẬT MENU KHI SCROLL
    --------------------------------------------------------
    */

    window.addEventListener(
        "scroll",
        updateActiveNav
    );


    updateActiveNav();

});


/*
============================================================
🟥 PHẦN 7 — LOAD NEWS LẦN 3
⭐ BẢN NÀY CÓ:
   - ẢNH
   - THỜI GIAN
   - CATEGORY
   - PLACEHOLDER "ĐỘ NHẠY"
   - LINK BÀI GỐC
============================================================
*/



async function loadNews() {
    try {
        const response = await fetch("/api/news");

        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu tin tức");
        }

        const allNews = await response.json();

        const newsList = document.getElementById("newsList");

        if (!newsList) return;

        const smartphoneKeywords = [
            "smartphone",
            "điện thoại",
            "mobile phone",
            "mobile",
            "iphone",
            "ipad",
            "samsung galaxy",
            "galaxy",
            "xiaomi",
            "oppo",
            "vivo",
            "honor",
            "huawei",
            "google pixel",
            "pixel phone",
            "oneplus",
            "realme",
            "nothing phone",
            "motorola",
            "sony xperia",
            "nokia phone",
            "snapdragon",
            "dimensity",
            "android",
            "ios",
            "one ui",
            "hyperos",
            "coloros",
            "funtouch os",
            "magicos"
        ];

        const smartphoneCategories = [
            "smartphone",
            "mobile",
            "mobile phone",
            "điện thoại",
            "phone"
        ];

        const normalize = text =>
            String(text || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        const isSmartphoneNews = item => {

            const category = normalize(item.category);

            const title = normalize(item.title);

            const description = normalize(item.description);

            // Category xác định rõ là smartphone
            if (
                smartphoneCategories.some(keyword =>
                    category.includes(normalize(keyword))
                )
            ) {
                return true;
            }

            // Tiêu đề có từ khóa smartphone
            if (
                smartphoneKeywords.some(keyword =>
                    title.includes(normalize(keyword))
                )
            ) {
                return true;
            }

            // Nội dung mô tả chỉ được dùng như điều kiện bổ sung
            const keywordInDescription =
                smartphoneKeywords.some(keyword =>
                    description.includes(normalize(keyword))
                );

            // Nếu mô tả có smartphone và category thuộc nhóm công nghệ
            const techCategories = [
                "tech",
                "technology",
                "cong nghe",
                "congnghe",
                "technology news"
            ];

            if (
                keywordInDescription &&
                techCategories.some(keyword =>
                    category.includes(normalize(keyword))
                )
            ) {
                return true;
            }

            return false;
        };

        const news = allNews.filter(isSmartphoneNews);

        newsList.innerHTML = news.map(item => {

            const time = item.published_at
                ? new Date(item.published_at).toLocaleTimeString(
                    "vi-VN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
                : "";

            return `
                <article class="news-card">

                    <div class="news-image ${item.image_url ? "" : "no-image"}">

                        ${
                            item.image_url
                                ? `<img
                                    src="${item.image_url}"
                                    alt="${item.title}"
                                   >`
                                : `<div class="news-placeholder">
                                    <span>ĐỘ NHẠY</span>
                                   </div>`
                        }

                    </div>

                    <div class="news-content">

                        <div class="news-meta">
                            ${time} · ${item.category || "SMARTPHONE"}
                        </div>

                        <h3>${item.title}</h3>

                        <p>${item.description || ""}</p>

                        <div class="news-footer">

                            <span>
                                ${item.source || ""}
                            </span>

                            ${
                                item.source_url
                                    ? `<a
                                        href="${item.source_url}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                       >
                                        Đọc bài gốc →
                                       </a>`
                                    : ""
                            }

                        </div>

                    </div>

                </article>
            `;

        }).join("");

    } catch (error) {
        console.error("Lỗi tải tin:", error);
    }
}

loadNews();

async function loadTrending() {
    try {
        const response = await fetch("/api/trending");

        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu trending");
        }

        const trending = await response.json();

        const trendingGrid =
            document.getElementById("trendingGrid");

        if (!trendingGrid) return;

        trendingGrid.innerHTML = trending.map((item, index) => {

            return `
                <article class="trend-card ${index === 0 ? "featured" : ""}">

                    <div class="trend-image">

                        ${
                            item.image_url
                                ? `<img
                                    src="${item.image_url}"
                                    alt="${item.title}"
                                   >`
                                : `<div class="news-placeholder">
                                    <span>ĐỘ NHẠY</span>
                                   </div>`
                        }

                    </div>

                    <div class="trend-content">

                        <span class="trend-tag">
                            ${index === 0 ? "🔥 HOT" : "SMARTPHONE"}
                        </span>

                        <h3>${item.title}</h3>

                        <p>
                            ${item.description || ""}
                        </p>

                        ${
                            item.source_url
                                ? `<a
                                    href="${item.source_url}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                   >
                                    Xem bài gốc →
                                   </a>`
                                : ""
                        }

                    </div>

                </article>
            `;

        }).join("");

    } catch (error) {

        console.error(
            "Lỗi tải trending:",
            error
        );
    }
}

loadTrending();