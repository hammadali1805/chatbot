"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});
// Import routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chats', chatRoutes);
// app.use('/api/study-plans', studyPlanRoutes);
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/notes', noteRoutes);
// app.use('/api/uploads', uploadRoutes);
// Start server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
