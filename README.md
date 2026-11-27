# 🌍 EuroSAT Land-Use Classifier

An interactive full-stack web application that classifies satellite terrain imagery into 10 land-use and land-cover categories based on geographic coordinates.

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

## How It Works

1. **Pick a Location:** Click anywhere on the interactive Leaflet map or enter latitude and longitude values.
2. **Fetch & Predict:** The React frontend sends the coordinates via Axios to the Express backend, which spawns a Python inference script to fetch the satellite tile and run the TensorFlow model.
3. **View Results:** Get the predicted land-use class, confidence score, and probability breakdown across EuroSAT classes.

## Project Structure

```text
├── client/          # React + Vite frontend with Leaflet map
├── server/          # Node.js + Express API & Python inference script
└── .gitignore
```

## Setup & Deployment
### 1. Local Setup
Backend (server/): Install Node dependencies (npm install) and Python packages (pip install -r requirements.txt), then start the server.

Frontend (client/): Install dependencies (npm install) and run npm run dev.

### 2. Cloud Deployment
Frontend (Vercel): Set VITE_API_URL (as a Config variable) to your live Render backend URL and redeploy.

Backend (Render): Deploy as a web service with build and start commands configured for Node and Python.
