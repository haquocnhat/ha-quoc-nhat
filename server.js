const Parser = require("rss-parser");
const express = require("express");
const { Pool } = require("pg");

const parser = new Parser();

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// KẾT NỐI POSTGRESQL
// ==============================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// ==============================
// WEBSITE
// ==============================

app.use(express.static("public"));

// ==============================
// API TIN MỚI — GENK
// ==============================

app.get("/api/news", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM news
            WHERE source = 'GenK'
              AND category = 'SMARTPHONE'
            ORDER BY published_at DESC
            LIMIT 20
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Không thể lấy dữ liệu tin tức"
        });
    }
});


// ==============================
// API TRENDING — DÂN TRÍ
// ==============================

app.get("/api/trending", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM news
            WHERE source = 'Dân trí'
              AND category = 'TRENDING'
            ORDER BY published_at DESC
            LIMIT 3
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Không thể lấy dữ liệu trending"
        });
    }
});


// ==============================
// TỪ KHÓA SMARTPHONE
// ==============================

const smartphoneKeywords = [

    "iphone",
    "ios",

    "samsung",
    "galaxy",

    "xiaomi",
    "redmi",

    "oppo",

    "vivo",

    "huawei",

    "honor",

    "pixel",

    "oneplus",

    "realme",

    "motorola",

    "nokia",

    "asus rog phone",

    "smartphone",

    "điện thoại",

    "điện thoại thông minh",

    "android",

    "snapdragon",

    "mediatek",

    "dimensity"

];


// ==============================
// KIỂM TRA CÓ PHẢI SMARTPHONE
// ==============================

function isSmartphone(title, description) {

    const text =
        `${title} ${description}`.toLowerCase();

    return smartphoneKeywords.some(keyword =>
        text.includes(keyword)
    );
}


// ==============================
// HÀM LẤY RSS
// ==============================

async function fetchRSS(url, category, source) {

    try {

        const feed =
            await parser.parseURL(url);

        console.log(
            `Đang cập nhật: ${source} - ${category} (${feed.items.length} bài)`
        );


        for (const item of feed.items.slice(0, 30)) {

            const title =
                item.title || "";

            const description =
                item.contentSnippet ||
                item.content ||
                item.description ||
                "";

            const sourceUrl =
                item.link || "";


            if (!sourceUrl) {
                continue;
            }


            // ==============================
            // LỌC SMARTPHONE CHO DÂN TRÍ
            // ==============================

            if (
                source === "Dân trí" &&
                !isSmartphone(title, description)
            ) {

                console.log(
                    `Bỏ qua: ${title}`
                );

                continue;
            }


            // ==============================
            // TÌM ẢNH
            // ==============================
// ==============================
// TÌM ẢNH
// ==============================

let imageUrl =
    item.enclosure?.url ||
    item["media:content"]?.url ||
    item["media:thumbnail"]?.url ||
    item.image?.url ||
    null;


// ==============================
// MEDIA GROUP
// ==============================

if (
    !imageUrl &&
    item["media:group"]
) {

    const group =
        item["media:group"];

    imageUrl =
        group["media:content"]?.url ||
        group["media:thumbnail"]?.url ||
        null;
}


// ==============================
// TÌM ẢNH TRONG HTML
// ==============================

if (!imageUrl) {

    const html =
        item.content ||
        item["content:encoded"] ||
        item.description ||
        "";

    const matches =
        html.match(
            /<img[^>]+(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["']/gi
        );

    if (matches && matches.length > 0) {

        const firstImage =
            matches[0].match(
                /(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["']/i
            );

        if (firstImage) {
            imageUrl = firstImage[1];
        }
    }
}


// ==============================
// LÀM SẠCH URL ẢNH
// ==============================

if (imageUrl) {

    imageUrl =
        imageUrl
            .replace(/&amp;/g, "&")
            .trim();

}


// ==============================
// DEBUG
// ==============================

console.log(
    `Ảnh: ${imageUrl || "KHÔNG CÓ"}`
);


            // media:group

            if (
                !imageUrl &&
                item["media:group"]
            ) {

                const group =
                    item["media:group"];

                imageUrl =
                    group["media:content"]?.url ||
                    group["media:thumbnail"]?.url ||
                    null;
            }


            // ==============================
            // TÌM ẢNH TRONG HTML
            // ==============================

            if (!imageUrl) {

                const html =
                    item.content ||
                    item.description ||
                    "";

                const match =
                    html.match(
                        /<img[^>]+(?:src|data-src)=["']([^"']+)["']/i
                    );

                if (match) {

                    imageUrl =
                        match[1];
                }
            }


            // ==============================
            // THỜI GIAN
            // ==============================

            const publishedAt =
                item.pubDate
                    ? new Date(item.pubDate)
                    : new Date();


            // ==============================
            // LƯU DATABASE
            // ==============================

            await pool.query(
                `
                INSERT INTO news
                (
                    title,
                    description,
                    source,
                    source_url,
                    image_url,
                    category,
                    published_at
                )

                VALUES
                ($1, $2, $3, $4, $5, $6, $7)

                ON CONFLICT (source_url)

                DO UPDATE SET

                    title =
                        EXCLUDED.title,

                    description =
                        EXCLUDED.description,

                    image_url =
                        EXCLUDED.image_url,

                    category =
                        EXCLUDED.category,

                    published_at =
                        EXCLUDED.published_at
                `,
                [
                    title,
                    description,
                    source,
                    sourceUrl,
                    imageUrl,
                    category,
                    publishedAt
                ]
            );

        }


        console.log(
            `✓ ${source}: ${category} đã cập nhật`
        );

    } catch (error) {

        console.error(
            `✗ Lỗi RSS ${source} ${category}:`,
            error.message
        );
    }
}


// ==============================
// RSS SOURCES
// ==============================

const rssSources = [

    // TRENDING
    {
        url:
            "https://dantri.com.vn/rss/cong-nghe.rss",

        category:
            "TRENDING",

        source:
            "Dân trí"
    },


    // TIN MỚI
    {
        url:
            "https://genk.vn/rss/mobile.rss",

        category:
            "SMARTPHONE",

        source:
            "GenK"
    }

];


// ==============================
// CẬP NHẬT
// ==============================

async function updateAllNews() {

    console.log("");
    console.log(
        "========== CẬP NHẬT TIN =========="
    );


    for (const source of rssSources) {

        await fetchRSS(
            source.url,
            source.category,
            source.source
        );
    }


    console.log(
        "========== HOÀN TẤT =========="
    );

    console.log("");
}


// ==============================
// SERVER
// ==============================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Website đang chạy tại http://localhost:${PORT}`
        );


        updateAllNews();


        setInterval(
            updateAllNews,
            15 * 60 * 1000
        );

    }
);