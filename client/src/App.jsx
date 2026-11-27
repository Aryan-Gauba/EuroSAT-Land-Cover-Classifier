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

// Automatically uses your live Vercel environment variable or falls back to localhost for local testing
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SAMPLE_LOCATIONS = [
    { label: 'Paris (48.8584, 2.2945)', coords: [48.8584, 2.2945] },
    { label: 'Amazon Forest (-3.4653, -62.2159)', coords: [-3.4653, -62.2159] },
    { label: 'Rotterdam Port (51.9489, 4.1455)', coords: [51.9489, 4.1455] },
    { label: 'New Delhi (28.6139, 77.2090)', coords: [28.6139, 77.2090] },
];

const EURO_SAT_CLASSES = [
    'AnnualCrop',
    'Forest',
    'HerbaceousVegetation',
    'Highway',
    'Industrial',
    'Pasture',
    'PermanentCrop',
    'Residential',
    'River',
    'SeaLake',
];

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
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleClassify = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const response = await axios.post(`${API_URL}/api/predict`, {
                lat: position[0],
                lon: position[1]
            });
            setResult(response.data);
        } catch (err) {
            setError('Failed to connect to the backend server. Please verify the API service is awake and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCoordChange = (index, rawValue) => {
        const parsed = parseFloat(rawValue);
        const nextVal = Number.isNaN(parsed) ? 0 : parsed;
        setPosition(index === 0 ? [nextVal, position[1]] : [position[0], nextVal]);
    };

    return (
        <div className="page-shell">
            <header className="site-header">
                <div className="header-inner">
                    <div className="brand-block">
                        <span className="brand-badge">Geospatial Deep Learning Explorer</span>
                        <h1 className="site-title">EuroSAT Land-Use Classifier</h1>
                    </div>
                    <div className="header-meta">
                        <span className="status-pill">10 Land-Cover Classes</span>
                        <span className="status-pill">Zoom 15 Satellite Tile</span>
                    </div>
                </div>
            </header>

            <main className="app-container">
                <section className="hero-banner">
                    <p className="subtitle">
                        Click anywhere on the satellite map or enter coordinates to inspect terrain and estimate land-use probabilities.
                    </p>
                    <div className="preset-row">
                        <span className="preset-label">Presets:</span>
                        {SAMPLE_LOCATIONS.map((loc) => (
                            <button
                                key={loc.label}
                                type="button"
                                className="preset-chip"
                                onClick={() => setPosition(loc.coords)}
                            >
                                {loc.label}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="workspace-grid">
                    <div className="left-column">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Interactive Map</h2>
                                <span className="coord-readout">
                                    {Number(position[0]).toFixed(4)}, {Number(position[1]).toFixed(4)}
                                </span>
                            </div>

                            <div className="map-wrapper">
                                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                                    <MapController center={position} />
                                    <LocationSelector position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>

                            <div className="controls-row">
                                <div className="inputs-pair">
                                    <div className="input-group">
                                        <label htmlFor="lat-input">Latitude</label>
                                        <input
                                            id="lat-input"
                                            type="number"
                                            step="any"
                                            value={position[0]}
                                            onChange={(e) => handleCoordChange(0, e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="lng-input">Longitude</label>
                                        <input
                                            id="lng-input"
                                            type="number"
                                            step="any"
                                            value={position[1]}
                                            onChange={(e) => handleCoordChange(1, e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClassify}
                                    disabled={loading}
                                    className="classify-btn"
                                >
                                    {loading ? 'Classifying...' : 'Classify Terrain'}
                                </button>
                            </div>

                            {error && <div className="error-banner">{error}</div>}
                        </div>

                        <div className="info-card">
                            <h3 className="card-title">Target EuroSAT Land-Use Classes</h3>
                            <p className="helper-copy">
                                The classifier evaluates 64x64 optical terrain patches across 10 land-use and land-cover categories:
                            </p>
                            <div className="classes-strip">
                                {EURO_SAT_CLASSES.map((cls) => (
                                    <span key={cls} className="class-tag">{cls}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="result-card">
                            <h2 className="card-title">Classification Result</h2>

                            {!result && !loading && (
                                <div className="empty-state">
                                    <p><strong>No location classified yet.</strong></p>
                                    <p className="helper-copy">
                                        Select a point on the map or pick a preset above, then click <strong>Classify Terrain</strong> to view the fetched satellite tile and class probabilities.
                                    </p>
                                </div>
                            )}

                            {loading && (
                                <div className="empty-state">
                                    <p>Fetching satellite tile and running CNN inference...</p>
                                </div>
                            )}

                            {result && (
                                <div className="result-content">
                                    <div className="result-summary-banner">
                                        <div>
                                            <span className="summary-label">Predicted Class</span>
                                            <div className="highlight-class">{result.predicted_class}</div>
                                        </div>
                                        <div className="confidence-box">
                                            <span className="summary-label">Confidence</span>
                                            <div className="confidence-value">{result.confidence}%</div>
                                        </div>
                                    </div>

                                    {result.tile_url && (
                                        <div className="image-preview">
                                            <img src={result.tile_url} alt="Satellite Tile" />
                                            <div className="preview-meta">
                                                <span className="image-caption">Fetched Map Tile (Zoom 15)</span>
                                                <span className="coord-readout">
                                                    {Number(position[0]).toFixed(4)}, {Number(position[1]).toFixed(4)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="result-details">
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
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="site-footer">
                <div className="footer-inner">
                    <span>EuroSAT Land-Use Classifier · Deep Learning &amp; Web GIS</span>
                    <span>Imagery: ArcGIS World Imagery · Inference: TensorFlow / Keras</span>
                </div>
            </footer>
        </div>
    );
}

export default App;