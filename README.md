# Naver Blog RSS Bot

A GitHub Actions-powered bot that monitors a Naver blog RSS feed and sends Discord notifications for new posts.

## Features

- 🔄 Monitors RSS feed every 10 minutes
- 📦 Stores post data in Supabase database
- 🔔 Sends Discord notifications for new posts
- ⚡ Runs automatically via GitHub Actions
- 🔒 Secure handling of sensitive data via GitHub Secrets

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
3. Copy your project's anon key

### 2. Discord Webhook Setup

1. Go to your Discord server settings
2. Navigate to Integrations > Webhooks
3. Create a new webhook and copy the URL

### 3. GitHub Repository Setup

1. Fork or clone this repository
2. Go to Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `BLOG_NAME`: Your Naver blog name (the part in the RSS URL)
   - `SUPABASE_PROJECT_ID`: Your Supabase project ID (the part before .supabase.co)
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `DISCORD_WEBHOOK_ID`: Discord webhook ID (the numbers in the webhook URL)
   - `DISCORD_WEBHOOK_TOKEN`: Discord webhook token (the string after the ID)

### 4. Configuration

The bot monitors the RSS feed based on the `BLOG_NAME` environment variable.

To change the target blog, update the `BLOG_NAME` secret in your GitHub repository settings.

## How It Works

1. **RSS Parsing**: Fetches and parses the Naver blog RSS feed
2. **Duplicate Detection**: Checks against stored posts in Supabase to identify new content
3. **Data Storage**: Saves new posts to Supabase database
4. **Notifications**: Sends formatted Discord notifications for new posts

## Manual Testing

To test locally:

1. Install dependencies: `npm install`
2. Set up environment variables (copy `.env.example` to `.env` and fill in values)
3. Run: `npm start`

## Files Overview

- `index.js`: Main bot script
- `package.json`: Node.js dependencies
- `supabase-schema.sql`: Database schema for Supabase
- `.github/workflows/rss-bot.yml`: GitHub Actions workflow
- `.env.example`: Environment variables template

## License

MIT