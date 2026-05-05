# IDOLWAVE YouTube API プロキシ

CORSを回避してブラウザから YouTube Data API v3 を安全に使うための
Vercel Serverless Functions プロキシです。

---

## デプロイ手順（5分で完了）

### 1. Vercel アカウントを作る
https://vercel.com → 「Sign Up」→ GitHubでログイン（無料）

### 2. このフォルダをGitHubにプッシュ
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/idolwave-proxy.git
git push -u origin main
```

### 3. Vercel にインポート
https://vercel.com/new → 「Import Git Repository」→ このリポジトリを選ぶ → Deploy

### 4. 環境変数を設定（重要！）
Vercel ダッシュボード → プロジェクト → Settings → Environment Variables

| Name | Value |
|------|-------|
| `YOUTUBE_API_KEY` | `AIzaSy...（あなたのAPIキー）` |

「Save」→ 「Redeploy」を実行

### 5. エンドポイントURLを確認
デプロイ完了後、以下のURLが使えるようになります：
```
https://あなたのプロジェクト名.vercel.app/api/youtube?videoId=動画ID
```

---

## IDOLWAVE アプリ側の変更

`idolwave-youtube.jsx` の fetchYouTube 関数内の URL を変更：

```js
// 変更前（直接叩いてCORSエラー）
const res = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?...&key=${apiKey}`
);

// 変更後（プロキシ経由）
const res = await fetch(
  `https://あなたのプロジェクト名.vercel.app/api/youtube?videoId=${videoId}`
);
```

---

## 動作確認

ブラウザで直接アクセスして確認できます：
```
https://あなたのプロジェクト名.vercel.app/api/youtube?videoId=KnMGrCDLVXo
```

JSONが返ってきたら成功です！

---

## 料金
Vercel の無料プラン（Hobby）で十分動きます。
- Serverless Functions: 月100GB-hours まで無料
- リクエスト数: 無制限（レート制限なし）
