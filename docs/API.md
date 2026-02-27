# 🔌 GitScore API Documentation

The GitScore API provides access to the mystical scoring engine and dynamic asset generation.

## 🌌 Public Endpoints

### 1. Badge Generation
Generate a live-updating SVG badge for any GitHub profile.

**Endpoint**: `GET /api/badge/[username]`

**Parameters**:
- `username` (required): GitHub login.
- `style` (optional): `mystical` (default), `flat`, `plastic`, `classic`.
- `label` (optional): Text on the left side (default: "GitScore").
- `showIcon` (optional): `true` or `false`.

**Response**: `image/svg+xml`

---

### 2. Watchlist Management
Monitor profile changes over time.

**Endpoint**: `GET /api/watchlist`
- **Response**: List of tracked profiles with latest scores.

**Endpoint**: `POST /api/watchlist`
- **Body**: `{ "username": "string", "score": number, "grade": "string" }`
- **Response**: Success status and entry details.

**Endpoint**: `DELETE /api/watchlist?username=[login]`
- **Response**: Removal confirmation.

---

### 3. Profile Analysis (SSR)
While not a JSON API, you can deep-link to the scoring engine results.

**URL**: `https://git-score-v1.vercel.app/score/[username]`

## ⚡ Rate Limits & Caching

- **GitHub API**: GitScore respects GitHub's Primary and Secondary rate limits. Authenticated requests (via PAT) allow for higher scrying throughput.
- **Edge Caching**: All badge and report assets are cached at the Vercel Edge for **1 hour** with `stale-while-revalidate` persistence.

## 🛡 Authentication

Local development requires a `GITHUB_TOKEN` in your environment. Production requests use the system's authenticated coordinates.

---
*Query the coordinates responsibly.*
