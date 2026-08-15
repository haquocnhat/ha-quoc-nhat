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
// API LẤY TIN
// ==============================

app.get("/api/news", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM news ORDER BY published_at DESC LIMIT 20"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Không thể lấy dữ liệu từ database"
        });
    }
});

app.get("/api/trending", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM news
            WHERE source = 'GenK'
              AND (
                  LOWER(category) LIKE '%smartphone%'
                  OR LOWER(category) LIKE '%dien thoai%'
              )
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
// HÀM LẤY RSS CHUNG
// ==============================

async function fetchRSS(url, category) {

    try {

        const feed = await parser.parseURL(url);

        console.log(
            `Đang cập nhật: ${category} (${feed.items.length} bài)`
        );

        for (const item of feed.items.slice(0, 20)) {

            const title = item.title || "";

            const description =
                item.contentSnippet ||
                item.content ||
                item.description ||
                "";

            const sourceUrl = item.link || "";

            const imageUrl =
                item.enclosure?.url ||
                item["media:content"]?.url ||
                item["media:thumbnail"]?.url ||
                null;

            const publishedAt = item.pubDate
                ? new Date(item.pubDate)
                : new Date();

            // Không có link thì bỏ qua
            if (!sourceUrl) {
                continue;
            }

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

                VALUES ($1, $2, $3, $4, $5, $6, $7)

                ON CONFLICT (source_url)
                DO UPDATE SET

                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    image_url = EXCLUDED.image_url,
                    category = EXCLUDED.category,
                    published_at = EXCLUDED.published_at
                `,
                [
                    title,
                    description,
                    "VnExpress",
                    sourceUrl,
                    imageUrl,
                    category,
                    publishedAt
                ]
            );
        }

        console.log(
            `✓ ${category}: đã cập nhật`
        );

    } catch (error) {

        console.error(
            `✗ Lỗi RSS ${category}:`,
            error.message
        );
    }
}

// ==============================
// DANH SÁCH RSS VNEXPRESS
// ==============================

const rssSources = [
    {
        url: "https://vnexpress.net/rss/so-hoa.rss",
        category: "CÔNG NGHỆ",
        source: "VnExpress"
    },
    {
        url: "https://genk.vn/rss/dien-thoai.rss",
        category: "SMARTPHONE",
        source: "GenK"
    }
];

// ==============================
// CẬP NHẬT TẤT CẢ RSS
// ==============================

async function updateAllNews() {

    console.log("");
    console.log("========== CẬP NHẬT TIN ==========");

    for (const source of rssSources) {

        await fetchRSS(
            source.url,
            source.category
        );
    }

    console.log("========== HOÀN TẤT ==========");
    console.log("");
}

// ==============================
// KHỞI ĐỘNG SERVER
// ==============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Website đang chạy tại http://localhost:${PORT}`
    );

    // Cập nhật ngay khi server khởi động
    updateAllNews();

    // Cập nhật mỗi 15 phút
    setInterval(
        updateAllNews,
        15 * 60 * 1000
    );
});