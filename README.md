# 🏃 Health Tracker - AI-Powered Calorie Tracking App

A comprehensive web application for tracking calories, weight, exercise, and nutrition with AI-powered food image analysis and Google Drive integration.

## ✨ Features

### Core Features
- 🍽️ **AI-Powered Food Analysis** - Upload food photos and get instant calorie and nutrition estimates using Claude AI
- 📸 **Google Drive Integration** - Automatically backup all food images to your Google Drive
- 📊 **Daily Dashboard** - Track calories, macros, water intake, and exercise in one place
- ⚖️ **Weight Tracking** - Monitor weight progress with interactive charts
- 💪 **Exercise Logging** - Track workouts and calories burned
- 💧 **Water Intake Tracker** - Stay hydrated with quick glass counting
- 📈 **Analytics & Insights** - Visualize your progress with detailed charts and statistics

### Additional Features
- 🔐 **User Authentication** - Secure JWT-based authentication
- 👤 **Profile Management** - Customize daily goals and personal information
- 🌙 **Dark Mode** - Easy on the eyes with automatic theme switching
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 📉 **Progress Visualization** - Beautiful charts using Recharts
- 🎯 **Goal Tracking** - Set and monitor daily calorie and macro goals

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **JWT** for authentication
- **Anthropic Claude API** for food image analysis
- **Google Drive API** for cloud storage
- **Multer** for file uploads

### Frontend
- **React 18** with React Router
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls
- **Context API** for state management

## 📋 Prerequisites

- Node.js 16+ and npm
- Anthropic API key (for Claude AI)
- Google Drive API credentials (optional, for cloud storage)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd claudecodetest
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Google Drive API (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id

# Database
DATABASE_PATH=./database/health_tracker.db

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Get API Keys

#### Anthropic Claude API Key
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key to your `.env` file

#### Google Drive API (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Download credentials and add to `.env`

### 5. Run the Application

#### Development Mode (Recommended)

Run both backend and frontend concurrently:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

#### Production Mode

Build and run:

```bash
# Build frontend
npm run build

# Start server
npm start
```

## 📱 Usage Guide

### 1. Create an Account

1. Navigate to `http://localhost:3000`
2. Click "Sign up"
3. Fill in your details (name, email, password, age, gender, height, daily goals)
4. Click "Sign Up"

### 2. Dashboard Overview

The dashboard shows:
- Today's calorie intake vs. goal
- Protein, carbs, fats consumed
- Water intake with quick add button
- Exercise summary
- Net calories (consumed - burned)

### 3. Log a Meal

1. Click "Meals" in navigation or "Log Meal" on dashboard
2. Click "+ Upload Food Photo"
3. Select a food image from your device
4. Choose meal type (breakfast, lunch, dinner, snack)
5. Set date and time
6. Add optional notes
7. Click "Upload & Analyze"
8. AI will analyze the image and estimate calories and macros

### 4. Track Weight

1. Go to "Weight" page
2. Click "+ Add Weight"
3. Enter your weight in kg
4. Select date
5. Add optional notes
6. View progress chart and history

### 5. Log Exercise

1. Navigate to "Exercise" page
2. Click "+ Add Exercise"
3. Enter exercise details:
   - Exercise name
   - Type (cardio, strength, yoga, etc.)
   - Duration in minutes
   - Estimated calories burned
4. Save the entry

### 6. View Analytics

1. Go to "Analytics" page
2. View various charts:
   - Weekly calorie intake
   - Macronutrient distribution
   - Exercise calories burned
   - Weight progress
   - Water intake trends

### 7. Manage Profile

1. Click "Profile" in navigation
2. Edit personal information
3. Adjust daily goals
4. Connect Google Drive for image backup

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/google-drive/auth-url` - Get Google Drive auth URL
- `POST /api/user/google-drive/callback` - Handle OAuth callback

### Meals
- `POST /api/meals/upload` - Upload meal image (multipart/form-data)
- `GET /api/meals` - Get all meals (with optional filters)
- `GET /api/meals/:id` - Get specific meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal
- `GET /api/meals/summary/today` - Get today's nutrition summary

### Weight
- `POST /api/weight` - Add weight entry
- `GET /api/weight` - Get weight history
- `GET /api/weight/latest` - Get latest weight
- `PUT /api/weight/:id` - Update weight entry
- `DELETE /api/weight/:id` - Delete weight entry

### Water Intake
- `POST /api/water` - Add/update water intake
- `POST /api/water/increment` - Increment today's water count
- `GET /api/water` - Get water intake history
- `GET /api/water/today` - Get today's water intake

### Exercise
- `POST /api/exercise` - Add exercise
- `GET /api/exercise` - Get exercise history
- `GET /api/exercise/summary/today` - Get today's exercise summary
- `PUT /api/exercise/:id` - Update exercise
- `DELETE /api/exercise/:id` - Delete exercise

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard overview
- `GET /api/analytics/weekly` - Get weekly trends
- `GET /api/analytics/monthly` - Get monthly statistics

## 🗄️ Database Schema

### Users Table
- id, email, password, name, age, gender, height
- daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal, daily_water_goal
- google_drive_refresh_token

### Meals Table
- id, user_id, meal_name, meal_type
- calories, protein, carbs, fats
- image_url, google_drive_id
- meal_date, meal_time, notes

### Weight Entries Table
- id, user_id, weight, entry_date, notes

### Water Intake Table
- id, user_id, glasses, entry_date

### Exercises Table
- id, user_id, exercise_name, exercise_type
- duration, calories_burned
- entry_date, entry_time, notes

## 🔧 Configuration

### JWT Secret
Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Calorie Calculation
The AI analyzes food images and estimates:
- Total calories
- Protein (grams)
- Carbohydrates (grams)
- Fats (grams)
- Serving size
- Confidence level

### Default Goals
- Calories: 2000 kcal/day
- Protein: 150g/day
- Carbs: 200g/day
- Fats: 65g/day
- Water: 8 glasses/day

## 🎨 UI/UX Features

- **Dark Mode Toggle** - Switch between light and dark themes
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Progress Bars** - Visual indicators for daily goals
- **Interactive Charts** - Hover for detailed information
- **Real-time Updates** - Instant feedback on all actions
- **Loading States** - Clear loading indicators
- **Error Handling** - User-friendly error messages

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens with 7-day expiration
- Protected API routes with authentication middleware
- Input validation on all forms
- SQL injection prevention with parameterized queries
- CORS enabled for frontend-backend communication

## 📊 Analytics Insights

The app provides:
- **Daily Summary** - Current day's nutrition and activity
- **Weekly Trends** - 7-day charts for all metrics
- **Monthly Statistics** - Average daily intake and workout stats
- **Weight Progress** - Visual weight change over time
- **Macro Distribution** - Pie chart of protein/carbs/fats ratio
- **Calorie Balance** - Net calories (consumed vs. burned)

## 🚧 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify `.env` file exists and is configured
- Ensure all dependencies are installed: `npm install`

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check CORS settings in server
- Ensure `REACT_APP_API_URL` is set correctly

### Food analysis not working
- Verify `ANTHROPIC_API_KEY` is valid
- Check API quota/limits
- Ensure image format is supported (jpg, png, gif, webp)

### Google Drive upload fails
- Verify Google Drive API is enabled
- Check OAuth credentials are correct
- Ensure redirect URI matches exactly
- Create a folder in Drive and set GOOGLE_DRIVE_FOLDER_ID

## 🤝 Contributing

This is a multi-agent collaborative project. Agent 3 focused on:
- Complete full-stack implementation
- AI-powered food analysis integration
- Google Drive cloud storage
- Comprehensive analytics dashboard
- Responsive UI with dark mode

## 📝 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Acknowledgments

- **Anthropic Claude AI** for food image analysis
- **Google Drive API** for cloud storage
- **Recharts** for beautiful data visualizations
- **Tailwind CSS** for rapid UI development

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for errors
4. Verify environment variables are set correctly

---

**Built with ❤️ by the Multi-Agent Team**

*Track your health, reach your goals!* 🎯
