const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/predict', (req, res) => {
    const { lat, lon } = req.body;
    if (lat === undefined || lon === undefined) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    // NOTE: If your packages are in your root venv, replace 'python' with the absolute path below:
    const pythonProcess = spawn('../.venv/Scripts/python.exe', ['predict.py', lat, lon]);
    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (chunk) => {
        dataString += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
        errorString += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            // PRINT THE ERROR TO THE TERMINAL SO YOU CAN SEE IT
            console.error('Python Error Traceback:', errorString);
            return res.status(500).json({ error: 'Inference execution failed', details: errorString });
        }
        try {
            const result = JSON.parse(dataString);
            if (result.error) {
                console.error('Python Script Error:', result.error);
                return res.status(500).json({ error: result.error });
            }
            res.json(result);
        } catch (e) {
            console.error('JSON Parse Error:', dataString);
            res.status(500).json({ error: 'Failed to parse model output.' });
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});