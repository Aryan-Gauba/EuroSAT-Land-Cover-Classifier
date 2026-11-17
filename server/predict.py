import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import sys
import io
import math
import json
import numpy as np
import requests
from PIL import Image
import tensorflow as tf

# Load the model once when the script runs
model = tf.keras.models.load_model('weights/complete_model.h5', compile=False)

CLASS_NAMES = [
    'Annual Crop', 'Forest', 'Herbaceous Vegetation', 'Highway', 
    'Industrial', 'Pasture', 'Permanent Crop', 'Residential', 'River', 'Sea/Lake'
]

def deg2num(lat_deg, lon_deg, zoom=15):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def fetch_satellite_image(lat, lon, zoom=15):
    x, y = deg2num(lat, lon, zoom)
    url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}"
    headers = {'User-Agent': 'EuroSAT-Classifier-App/1.0'}
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    img = Image.open(io.BytesIO(response.content)).convert('RGB')
    img_cropped = img.crop((64, 64, 192, 192))
    return img_cropped.resize((64, 64))

if __name__ == '__main__':
    try:
        lat = float(sys.argv[1])
        lon = float(sys.argv[2])
        
        xtile, ytile = deg2num(lat, lon, 15)
        img = fetch_satellite_image(lat, lon)
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_batch = np.expand_dims(img_array, axis=0)

        preds = model.predict(img_batch, verbose=0)[0]
        top_idx = int(np.argmax(preds))

        probabilities = {
            CLASS_NAMES[i]: round(float(preds[i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }

        result = {
            'predicted_class': CLASS_NAMES[top_idx],
            'confidence': round(float(preds[top_idx]) * 100, 2),
            'probabilities': probabilities,
            'tile_url': f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/{ytile}/{xtile}'
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)