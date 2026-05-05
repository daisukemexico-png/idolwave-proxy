api/youtube.js
// api/youtube.js
// Vercel Serverless Function - YouTube Data API v3 プロキシ
// CORSを解決してブラウザから安全にYouTube APIを叩けるようにする

export default async function handler(req, res) {
  // CORSヘッダーを設定（全オリジンを許可 - 本番では自分のドメインに絞ること）
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // プリフライトリクエスト対応
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GETのみ許可
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: "videoId は必須です" });
  }

  // APIキーはVercelの環境変数から取得（絶対にコードに直書きしない）
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "YOUTUBE_API_KEY が環境変数に設定されていません" });
  }

  try {
    const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
    const ytRes = await fetch(ytUrl);

    if (!ytRes.ok) {
      const errBody = await ytRes.json();
      return res.status(ytRes.status).json({
        error: "YouTube API エラー",
        detail: errBody?.error?.message || ytRes.statusText,
      });
    }

    const data = await ytRes.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: "動画が見つかりませんでした" });
    }

    const item = data.items[0];

    // 必要なフィールドだけ返す（APIキーをレスポンスに含めない）
    return res.status(200).json({
      id: videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      description: item.snippet.description?.slice(0, 400) || "",
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      viewCount: Number(item.statistics.viewCount || 0),
      likeCount: Number(item.statistics.likeCount || 0),
      commentCount: Number(item.statistics.commentCount || 0),
      publishedAt: item.snippet.publishedAt?.slice(0, 10) || "",
      tags: item.snippet.tags?.slice(0, 10) || [],
      duration: item.contentDetails?.duration || "",
    });
  } catch (err) {
    return res.status(500).json({
      error: "サーバーエラー",
      detail: err.message,
    });
  }
}
