const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route for verification
app.get('/', (req, res) => {
    res.send('Interview Agent Backend is running!');
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Mock Data
let interviews = [
    { id: 1, candidateName: 'John Doe', role: 'Frontend Developer', date: '2023-10-27' },
    { id: 2, candidateName: 'Jane Smith', role: 'Backend Developer', date: '2023-10-28' }
];

// Routes

// 1. Get all interviews
app.get('/api/interviews', (req, res) => {
    res.json(interviews);
});

// 2. Create a new interview
app.post('/api/interviews', (req, res) => {
    const { candidateName, role } = req.body;
    const newInterview = {
        id: interviews.length + 1,
        candidateName,
        role,
        date: new Date().toISOString().split('T')[0]
    };
    interviews.push(newInterview);
    res.status(201).json(newInterview);
});

// 3. Upload Transcript
app.post('/api/upload', upload.single('transcript'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        path: req.file.path
    });
});

// 4. Sentiment Analysis (Mock)
app.post('/api/analyze', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided for analysis' });
    }

    // Simple mock logic
    const lowerText = text.toLowerCase();
    let sentiment = 'Neutral';
    let score = 0.5;

    if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('excellent')) {
        sentiment = 'Positive';
        score = 0.8 + Math.random() * 0.2;
    } else if (lowerText.includes('bad') || lowerText.includes('poor') || lowerText.includes('fail')) {
        sentiment = 'Negative';
        score = 0.1 + Math.random() * 0.3;
    }

    res.json({
        sentiment,
        score: score.toFixed(2),
        analysis_timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
