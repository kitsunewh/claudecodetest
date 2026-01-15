# HealthTrack - AI-Powered Calorie & Health Tracking App

A comprehensive web application for tracking calories, nutrition, weight, and overall health goals. Features AI-powered food recognition from images, Google Drive integration for storage, and beautiful progress visualization.

## Features

### Core Features
- **AI Food Recognition**: Upload food images and get automatic calorie and nutrition estimates
- **Google Drive Integration**: Securely store food images in your Google Drive
- **Calorie Tracking**: Track daily calorie intake with detailed meal logging
- **Nutritional Breakdown**: Monitor protein, carbs, and fats for each meal
- **Weight Tracking**: Log and visualize weight progress over time
- **Goal Setting**: Set personalized daily calorie and macronutrient goals
- **Progress Charts**: Beautiful visualizations of your health journey
- **Meal History**: Review past meals with images and nutritional data

### Additional Features
- **Water Intake Tracking**: Monitor daily water consumption
- **Exercise Logging**: Track workouts and calories burned
- **Daily Statistics**: View comprehensive daily summaries
- **Streak Tracking**: Maintain consistency with streak counters
- **Meal Categorization**: Organize meals by breakfast, lunch, dinner, and snacks
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **SQLite** - Lightweight database
- **Multer** - File upload handling
- **Google Drive API** - Cloud storage
- **OpenAI Vision API** - AI food recognition
- **bcrypt** - Password hashing

## Project Structure

```
health-tracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   └── Layout.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FoodLog.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Login.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── server.js        # Express server and routes
│   │   ├── database.js      # SQLite database setup
│   │   ├── googleDrive.js   # Google Drive integration
│   │   └── aiService.js     # AI food recognition
│   ├── database/            # SQLite database files
│   ├── uploads/             # Local image storage
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **(Optional)** Google Cloud account for Drive integration
- **(Optional)** OpenAI API key for AI food recognition

### 1. Clone the Repository

```bash
git clone <repository-url>
cd health-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration (optional)
nano .env
```

The backend will work without any API keys, using mock data for food recognition and local storage for images.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### Option 2: Production Build

```bash
# Build frontend
cd frontend
npm run build

# Serve from backend (configure Express to serve static files)
cd ../backend
npm start
```

## Usage Guide

### 1. Create an Account
- Open the app at `http://localhost:3000`
- Click "Don't have an account? Register"
- Fill in your details and create an account

### 2. Set Your Goals
- Navigate to **Profile** page
- Set your daily calorie goal
- Configure macronutrient targets (protein, carbs, fats)
- Set your target weight and water intake goal
- Click "Save Goals"

### 3. Log Your Weight
- Go to **Profile** page
- Enter your current weight in the "Log Current Weight" section
- Track your progress over time in the **Progress** page

### 4. Log Food
- Click **Log Food** in the navigation
- Upload a food image (optional but recommended)
  - The AI will analyze it and suggest calories/nutrition
- Or manually enter food details
- Select meal type (breakfast, lunch, dinner, snack)
- Click "Log Meal"

### 5. Track Your Progress
- **Dashboard**: View today's summary, calorie progress, and recent meals
- **History**: Review past meals and daily totals
- **Progress**: See weight trends and calorie intake charts
- Track your logging streak to stay motivated!

### 6. Additional Tracking
- **Water Intake**: Click "+ Add 1 cup" on the Dashboard
- **Exercise**: Use the Exercise API endpoints to log workouts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login user

### Meals
- `POST /api/meals` - Log a new meal (with image upload)
- `GET /api/meals/:userId?date=YYYY-MM-DD` - Get meals for a user/date
- `PUT /api/meals/:mealId` - Update meal details
- `DELETE /api/meals/:mealId` - Delete a meal

### Weight
- `POST /api/weight` - Log weight
- `GET /api/weight/:userId?days=30` - Get weight history

### Goals
- `GET /api/goals/:userId` - Get user goals
- `PUT /api/goals/:userId` - Update user goals

### Water
- `POST /api/water` - Log water intake
- `GET /api/water/:userId?date=YYYY-MM-DD` - Get water intake

### Exercise
- `POST /api/exercise` - Log exercise
- `GET /api/exercise/:userId?date=YYYY-MM-DD` - Get exercises

### Statistics
- `GET /api/statistics/:userId?days=7` - Get statistics and trends

### AI Analysis
- `POST /api/analyze-food` - Analyze food image with AI

## Optional: Google Drive Setup

To enable Google Drive storage for food images:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Create credentials:
   - Click "Create Credentials" > "Service Account"
   - Download the JSON key file
   - Rename it to `credentials.json`
   - Place it in the `backend/` directory
5. Create a folder in Google Drive for storing images
6. Share the folder with the service account email (found in credentials.json)
7. Copy the folder ID from the URL and add to `.env`:
   ```
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
   ```

## Optional: AI Food Recognition Setup

### Option 1: OpenAI Vision API

1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env`:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Option 2: Nutritionix API

1. Sign up at [Nutritionix Developer](https://developer.nutritionix.com)
2. Get your App ID and Key
3. Add to `.env`:
   ```
   NUTRITIONIX_APP_ID=your_app_id
   NUTRITIONIX_APP_KEY=your_app_key
   ```

## Database Schema

### users
- id, username, password, name, email, created_at

### meals
- id, user_id, food_name, calories, protein, carbs, fats, meal_type, image_url, timestamp

### weight_logs
- id, user_id, weight, date

### goals
- id, user_id, daily_calorie_goal, protein_goal, carbs_goal, fats_goal, water_goal, target_weight

### water_intake
- id, user_id, amount, date

### exercises
- id, user_id, exercise_name, duration, calories_burned, timestamp

## Features in Detail

### AI-Powered Food Recognition
When you upload a food image, the app:
1. Sends the image to OpenAI Vision API or Nutritionix
2. Receives estimated nutrition data
3. Pre-fills the form with detected values
4. Allows manual editing before saving

Without API keys, mock data is used for demonstration.

### Google Drive Integration
- Images are uploaded to your Google Drive
- Stored in a dedicated folder
- Publicly accessible links are generated
- Images are automatically deleted when meals are removed

Without credentials, images are stored locally in `backend/uploads/`.

### Progress Tracking
- **Weight Chart**: Line chart showing weight trend over time
- **Calorie Chart**: Bar chart comparing intake vs. goal
- **Statistics**: Average calories, total meals logged, streak days
- **Customizable Time Range**: View 7, 30, or 90-day trends

## Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database issues
Delete the database and restart:
```bash
rm backend/database/health_tracker.db
npm start
```

### Images not uploading
- Check `backend/uploads/` directory exists
- Verify file size is under 10MB
- Ensure image format is JPG, JPEG, or PNG

## Contributing

This is a multi-agent development project. Agent 5 is responsible for this implementation.

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Barcode scanning for packaged foods
- [ ] Social features and meal sharing
- [ ] Recipe database and meal planning
- [ ] Integration with fitness trackers
- [ ] AI meal suggestions based on goals
- [ ] Export data to CSV/PDF
- [ ] Dark mode support
- [ ] Multi-language support

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

---

**Built with ❤️ by Agent 5** - A comprehensive health tracking solution for people committed to their wellness journey.
