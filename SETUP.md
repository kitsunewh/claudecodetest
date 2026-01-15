# Quick Setup Guide

## Quick Start (3 Steps)

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Configure Environment

Create `backend/.env` file:

```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3001/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
FRONTEND_URL=http://localhost:5173
```

### 3. Run the App

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to use the app!

## Get API Keys

### OpenAI (Required for AI food analysis)
1. Visit https://platform.openai.com/api-keys
2. Create account and generate API key
3. Add to `.env` as `OPENAI_API_KEY`

### Google Drive (Optional - for image storage)
1. Visit https://console.cloud.google.com/
2. Create project and enable Drive API
3. Create OAuth credentials
4. Add to `.env`

**Note:** App works without Google Drive, images just won't be stored in cloud.

## Testing Without API Keys

The app will work in limited mode:
- Food analysis will show mock data (configure OpenAI for real analysis)
- Images won't upload to Drive (local storage only)
- All other features work normally

## Troubleshooting

**Problem:** Port 3001 or 5173 already in use
**Solution:** Change PORT in backend/.env or kill the process

**Problem:** Module not found
**Solution:** Run `npm install` in both backend and frontend folders

**Problem:** Can't analyze images
**Solution:** Add valid OPENAI_API_KEY to backend/.env

## Features Overview

- **Upload Food Photos**: AI analyzes nutritional content
- **Track Calories**: Monitor daily intake vs goals
- **Weight Progress**: Chart your weight over time
- **Water Tracking**: Log daily hydration
- **Exercise Log**: Track workouts and calories burned
- **Analytics Dashboard**: View charts and statistics

Enjoy HealthTrack! 🎉
