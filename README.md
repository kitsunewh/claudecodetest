# HealthTrack - AI-Powered Health & Calorie Tracking App

A comprehensive web application for tracking nutrition, calories, weight, and fitness goals using AI-powered food image analysis and Google Drive integration.

## Features

### Core Features
- **AI-Powered Food Analysis**: Upload food photos and get instant nutritional breakdowns using OpenAI's GPT-4 Vision
- **Calorie Tracking**: Comprehensive tracking of calories, protein, carbs, fats, fiber, and sugar
- **Meal History**: View and manage all logged meals with detailed nutritional information
- **Weight Tracking**: Monitor weight progress over time with visual charts
- **Water Intake**: Track daily water consumption with goal setting
- **Exercise Logging**: Log workouts and track calories burned
- **Analytics Dashboard**: Visual charts and statistics for nutrition insights
- **Google Drive Integration**: Automatically store food images in Google Drive
- **Goal Setting**: Set personalized calorie and fitness goals

### Advanced Features
- Real-time nutritional analysis with AI
- Editable meal entries for accuracy
- Multiple meal types (breakfast, lunch, dinner, snacks)
- Progress visualization with charts
- Weekly and monthly statistics
- Responsive design for mobile and desktop
- Dark mode support in UI components

## Tech Stack

### Backend
- **Node.js** with Express.js
- **OpenAI API** (GPT-4 Vision) for food image analysis
- **Google Drive API** for cloud storage
- **JSON file storage** for data persistence (easily upgradable to database)
- **Multer** for file upload handling

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Chart.js** with react-chartjs-2 for data visualization
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **date-fns** for date formatting

## Project Structure

```
healthtrack/
├── backend/
│   ├── server.js              # Express server
│   ├── services/
│   │   ├── aiService.js       # OpenAI food analysis
│   │   ├── driveService.js    # Google Drive integration
│   │   └── dataService.js     # Data management
│   ├── data/                  # JSON data storage
│   ├── uploads/               # Temporary image uploads
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FoodCapture.jsx
│   │   │   ├── MealHistory.jsx
│   │   │   ├── WeightTracker.jsx
│   │   │   ├── WaterTracker.jsx
│   │   │   ├── ExerciseLog.jsx
│   │   │   └── Profile.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key
- Google Cloud account (for Drive API)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
PORT=3001
NODE_ENV=development

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Google Drive API Configuration
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3001/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Getting API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add to `.env` as `OPENAI_API_KEY`

#### Google Drive API
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/oauth2callback`
6. Download credentials and add to `.env`
7. Create a folder in Google Drive and get its ID from the URL
8. Add folder ID to `.env` as `GOOGLE_DRIVE_FOLDER_ID`

### 4. Running the Application

**Development Mode:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

**Production Build:**

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

## API Endpoints

### Food Analysis
- `POST /api/analyze-food` - Upload and analyze food image
- `POST /api/meals` - Save analyzed meal
- `GET /api/meals` - Get meal history
- `DELETE /api/meals/:id` - Delete meal

### Statistics
- `GET /api/stats?period=week` - Get nutrition statistics

### Weight Tracking
- `GET /api/weight` - Get weight history
- `POST /api/weight` - Add weight entry

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Water & Exercise
- `GET /api/water?date=YYYY-MM-DD` - Get water intake
- `POST /api/water` - Add water intake
- `GET /api/exercises` - Get exercise log
- `POST /api/exercises` - Add exercise

## Usage Guide

### 1. Capture Food
1. Navigate to "Capture Food" page
2. Upload a photo of your meal
3. Select meal type (breakfast, lunch, dinner, snack)
4. Click "Analyze Food"
5. Review AI-generated nutritional information
6. Edit values if needed
7. Save meal

### 2. Track Weight
1. Go to "Weight" page
2. Enter your weight
3. Select date
4. Add optional notes
5. View progress chart

### 3. Log Water
1. Navigate to "Water" page
2. Click "Add 1 Glass" or "Add 2 Glasses"
3. Track progress toward daily goal

### 4. Log Exercise
1. Go to "Exercise" page
2. Click "Log Exercise"
3. Fill in exercise details
4. Save to track calories burned

### 5. View Dashboard
- See daily calorie intake vs goals
- View macronutrient distribution
- Check weekly trends
- Monitor recent meals

### 6. Set Goals
1. Navigate to "Profile" page
2. Enter personal information
3. Set target weight
4. Adjust daily calorie and water goals
5. Save profile

## Features for Weight Loss

This app is specifically designed to help with weight loss:

1. **Calorie Deficit Tracking**: Monitor calorie intake vs expenditure
2. **Macronutrient Balance**: Ensure proper protein, carbs, and fat ratios
3. **Progress Visualization**: See weight trends over time
4. **Goal Setting**: Set realistic calorie and weight targets
5. **Accountability**: Log all meals and exercises
6. **Hydration Tracking**: Stay hydrated for optimal metabolism
7. **Exercise Integration**: Track calories burned from workouts
8. **Analytics**: Identify patterns and adjust diet accordingly

## Configuration Options

### Adjusting AI Analysis
Modify `backend/services/aiService.js` to customize the AI prompt for different dietary preferences or regional foods.

### Database Migration
The app currently uses JSON files. To migrate to a database:
1. Install database driver (e.g., `mongodb`, `pg`)
2. Update `backend/services/dataService.js`
3. Replace file operations with database queries

### Custom Themes
Edit `frontend/tailwind.config.js` to customize colors and styling.

## Troubleshooting

### Issue: OpenAI API errors
- **Solution**: Verify API key is correct and has credits

### Issue: Google Drive upload fails
- **Solution**: Check credentials and folder permissions

### Issue: Images not uploading
- **Solution**: Ensure uploads directory exists and has write permissions

### Issue: Port already in use
- **Solution**: Change PORT in `.env` or kill process using the port

## Security Considerations

- API keys stored in `.env` (never commit)
- File upload validation (images only, 10MB limit)
- CORS configured for specific origin
- Input validation on all forms
- No authentication (add JWT/OAuth for production)

## Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Barcode scanning for packaged foods
- [ ] Meal planning and recipes
- [ ] Social features (share progress)
- [ ] Mobile app (React Native)
- [ ] Integration with fitness trackers
- [ ] AI meal recommendations
- [ ] Export data to CSV/PDF
- [ ] Offline mode with sync
- [ ] Dark mode toggle

## Contributing

This is a team project with 5 agents. Each agent contributes to different aspects:
- Agent 1-3: [To be defined by team]
- Agent 4: Core application development (current)
- Agent 5: [To be defined by team]

## License

MIT License - feel free to use and modify for your needs.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Verify environment variables
4. Check browser console for errors

## Credits

- Built with React, Node.js, and modern web technologies
- AI powered by OpenAI GPT-4 Vision
- Icons by Lucide React
- Charts by Chart.js

---

**HealthTrack** - Your AI-powered companion for achieving health and fitness goals! 🏃‍♂️💪🥗
