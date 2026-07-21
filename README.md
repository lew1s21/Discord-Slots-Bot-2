# Discord Slots Bot

Quick start:

1. Copy `.env.example` to `.env` and set `DISCORD_TOKEN`:

```powershell
Copy-Item .env.example .env
# edit .env to set DISCORD_TOKEN
```

2. Install deps (if not already):

```bash
npm install
```

3. Run the bot:

```bash
npm start
```

Security:
- Rotate the exposed token in the Discord Developer Portal immediately.
- Never commit `.env` — it's already in `.gitignore`.

Notes:
- `dotenv` is loaded automatically in `index.js` for local development.
- If you want me to scrub the token from git history, I can add instructions or run `git` commands locally.