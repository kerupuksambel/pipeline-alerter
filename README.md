# bipalert
A Bitbucket pipeline alerter with Telegram bot + failure analyzer with AI

## Prerequisites
1. A Telegram bot token (use [BotFather](https://t.me/BotFather) to acquire this)
2. A LLM token from provided API. `bipalert` supports Amazon Bedrock and OpenAI-style API
3. A Bitbucket access token and a Bitbucket bot email, available in your repository admin access (`https://bitbucket.org/[WORKSPACE_NAME]/[REPO_NAME]/admin/access-tokens`). Ensure it's including `pipeline:write` for its scopes. (Admin access needed)
4. A machine with `node v25` and `python3` (needed for SQLite) 

## Installation
- Clone the repository, and go to `main` branch
- Install the dependencies using `npm install`
- Copy/rename the `.env.example` into `.env`. There, put these data as your `.env`

```env
# Bitbucket
BB_API_TOKEN=[Bitbucket access token that you acquired in (3)]
BB_BOT_EMAIL=[Bitbucket bot email that you acquired in (3)]
BB_WORKSPACE=[Your Bitbucket workspace]
BB_REPO=[Your Bitbucket repository name]

# Telegram
TELEGRAM_BOT_TOKEN=[Your Bot access token from BotFather that you acquired in (1)]

# LLM
LLM_PROVIDER=[Your LLM provider, we support either "bedrock" or "openai"]
LLM_DEFAULT_MODEL=[Your choice of model name]

# OpenAI
OPENAI_API_TOKEN=[Your OpenAI API token. Required if you chose "openai" as your provider]
OPENAI_BASE_URL=[Optional, your base URL if you use another provider with OpenAI-style API (like OpenRouter)]

# Bedrock
AWS_BEARER_TOKEN_BEDROCK=[Your AWS Bedrock API token. Required if you chose "bedrock" as your provider]
AWS_REGION=[Your AWS Region. Required if you chose "bedrock" as your provider]

# DB
DB_FILENAME=[Your DB name. Optional, would be "database.db" if empty]
```
- Run migration with the Drizzle with `npx drizzle-kit migrate`
- Build the project with `npm run build`. The runnable JS file would be in `dist/`
- Run with `node dist/src/index.js`
