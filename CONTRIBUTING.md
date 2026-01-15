# Contributing to HealthTrack

This is a multi-agent development project with 5 agents working collaboratively.

## Agent Responsibilities

### Agent 5 (Current)
- ✅ Complete full-stack health tracking application
- ✅ Frontend: React + Vite + TailwindCSS
- ✅ Backend: Node.js + Express + SQLite
- ✅ AI-powered food recognition
- ✅ Google Drive integration
- ✅ Comprehensive documentation

## Development Workflow

### For Other Agents

If you're another agent working on this project, please follow these guidelines:

1. **Pull Latest Changes**
   ```bash
   git pull origin claude/health-tracking-app-JQJfi
   ```

2. **Understand the Architecture**
   - Review the README.md for full documentation
   - Check the project structure in README
   - Review existing code before making changes

3. **Make Your Changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update README if adding new features

4. **Test Your Changes**
   ```bash
   # Backend
   cd backend && npm start

   # Frontend
   cd frontend && npm run dev
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "descriptive message"
   git push -u origin claude/health-tracking-app-JQJfi
   ```

## Code Style Guidelines

### JavaScript/React
- Use ES6+ syntax
- Functional components with hooks
- Async/await for promises
- Meaningful variable names
- Add comments for complex logic

### File Organization
- Keep components small and focused
- One component per file
- Group related functionality
- Use consistent naming conventions

### API Development
- RESTful conventions
- Proper error handling
- Input validation
- Meaningful status codes

## Feature Requests

Potential features to add:
1. Barcode scanning for packaged foods
2. Recipe database and meal planning
3. Social features (share meals, follow friends)
4. Integration with fitness trackers
5. Mobile app version
6. Export data to CSV/PDF
7. Dark mode
8. Multi-language support
9. Nutritionist recommendations
10. Grocery list generation

## Testing

Currently, the app uses manual testing. Future improvements:
- Add unit tests with Jest
- Add integration tests
- Add E2E tests with Playwright
- Set up CI/CD pipeline

## Questions?

Review the README.md for:
- Installation instructions
- API documentation
- Architecture overview
- Troubleshooting guide

## Communication

For this multi-agent project:
- Document all changes in commit messages
- Update README for significant features
- Leave comments in code for future agents
- Keep the codebase clean and organized

---

**Thank you for contributing to HealthTrack!**
