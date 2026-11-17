import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Automatically use the Vercel env variable in production, or localhost for local testing
const API_URL = import.meta.env.API_URL || 'http://localhost:5000';

// Helper component to center map whenever position changes
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), {
            animate: true
        });
    }, [center, map]);
    return null;
}

function LocationSelector({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position === null ? null : <Marker position={position} />;
}

function App() {
    const [position, setPosition] = useState([48.8584, 2.2945]); // Default Paris
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleClassify = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await axios.post(`${API_URL}/api/predict`, {
                lat: position[0],
                lon: position[1]
            });
            setResult(response.data);
        } catch (err) {
            alert('Failed to connect to backend server.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <h1>EuroSAT Land-Use Classifier</h1>
            <p className="subtitle">Click anywhere on the map or enter coordinates to classify the terrain.</p>

            <div className="card">
                <div className="map-wrapper">
                    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        <MapController center={position} />
                        <LocationSelector position={position} setPosition={setPosition} />
                    </MapContainer>
                </div>

                <div className="controls-row">
                    <div className="input-group">
                        <label>Latitude</label>
                        <input 
                            type="number" 
                            value={position[0]} 
                            onChange={(e) => setPosition([parseFloat(e.target.value) || 0, position[1]])} 
                        />
                    </div>
                    <div className="input-group">
                        <label>Longitude</label>
                        <input 
                            type="number" 
                            value={position[1]} 
                            onChange={(e) => setPosition([position[0], parseFloat(e.target.value) || 0])} 
                        />
                    </div>
                    <button 
                        onClick={handleClassify} 
                        disabled={loading}
                        className="classify-btn"
                    >
                        {loading ? 'Classifying...' : 'Classify Terrain'}
                    </button>
                </div>
            </div>

            {result && (
                <div className="result-card">
                    <h2>Classification Result</h2>
                    <div className="result-content">
                        {result.tile_url && (
                            <div className="image-preview">
                                <img src={result.tile_url} alt="Satellite Tile" />
                                <span className="image-caption">Fetched Map Tile (Zoom 15)</span>
                            </div>
                        )}
                        <div className="result-details">
                            <p><strong>Predicted Class:</strong> <span className="highlight-class">{result.predicted_class}</span></p>
                            <p><strong>Confidence:</strong> {result.confidence}%</p>

                            <h4>Probability Breakdown</h4>
                            <div className="probabilities-list">
                                {Object.entries(result.probabilities)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([className, percentage]) => (
                                        <div key={className} className="prob-item">
                                            <div className="prob-header">
                                                <span>{className}</span>
                                                <span>{percentage}%</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div 
                                                    className={`progress-bar-fill ${className === result.predicted_class ? 'winner' : ''}`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;