import requests
import os
import json
import base64
import time
from config.settings import CDSE_CLIENT_ID, CDSE_CLIENT_SECRET

AUTH_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
CATALOG_URL = "https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search"
PROCESS_URL = "https://sh.dataspace.copernicus.eu/process/v1"

class CopernicusService:
    def __init__(self):
        self.access_token = None
        self.token_expiry = 0

    def _authenticate(self):
        if not CDSE_CLIENT_ID or not CDSE_CLIENT_SECRET:
            print("WARNING: CDSE credentials missing. Operating in MOCK mode.")
            return "MOCK_TOKEN"
            
        if self.access_token and time.time() < self.token_expiry:
            return self.access_token

        try:
            data = {
                "grant_type": "client_credentials",
                "client_id": CDSE_CLIENT_ID,
                "client_secret": CDSE_CLIENT_SECRET
            }
            resp = requests.post(AUTH_URL, data=data, timeout=10)
            if resp.status_code != 200:
                print(f"CDSE Auth failed: {resp.text}. Falling back to MOCK mode.")
                return "MOCK_TOKEN"
                
            token_data = resp.json()
            self.access_token = token_data.get("access_token")
            self.token_expiry = time.time() + token_data.get("expires_in", 3600) - 60
            return self.access_token
        except Exception as e:
            print(f"CDSE Auth network error: {e}. Falling back to MOCK mode.")
            return "MOCK_TOKEN"

    def search_imagery(self, bbox: list, time_start: str, time_end: str, max_cloud_cover: int = 20):
        token = self._authenticate()
        if token == "MOCK_TOKEN":
            # Return realistic mock metadata
            return [
                {
                    "id": f"S2B_MSIL2A_{time_start.replace('-', '')}_MOCK",
                    "date": f"{time_start}T10:30:00Z",
                    "cloud_cover": 2.5,
                    "platform": "Sentinel-2B",
                    "bbox": bbox
                }
            ]

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # The frontend now strictly enforces YYYY-MM-DD.
        # Avoid dateutil here because dayfirst=True can flip YYYY-MM-DD (e.g. 2025-05-10 -> Oct 5).
        iso_start = f"{time_start}T00:00:00Z"
        iso_end = f"{time_end}T23:59:59Z"

        payload = {
            "bbox": bbox,
            "datetime": f"{iso_start}/{iso_end}",
            "collections": ["sentinel-2-l2a"],
            "limit": 10,
            "filter": {
                "op": "<=",
                "args": [{"property": "eo:cloud_cover"}, max_cloud_cover]
            },
            "filter-lang": "cql2-json"
        }
        
        try:
            resp = requests.post(CATALOG_URL, headers=headers, json=payload, timeout=15)
            if resp.status_code != 200:
                raise Exception(f"Failed to search catalog: {resp.text}")
        except Exception as e:
            print(f"Catalog search failed: {e}. Falling back to MOCK mode.")
            return [
                {
                    "id": f"S2A_MSIL2A_{time_start.replace('-', '')}_MOCK",
                    "date": f"{time_start}T10:30:00Z",
                    "cloud_cover": 5.0,
                    "platform": "Sentinel-2A",
                    "bbox": bbox
                }
            ]
            
        data = resp.json()
        features = data.get("features", [])
        
        results = []
        for feature in features:
            props = feature.get("properties", {})
            results.append({
                "id": feature.get("id"),
                "date": props.get("datetime"),
                "cloud_cover": props.get("eo:cloud_cover"),
                "platform": props.get("platform"),
                "bbox": feature.get("bbox"),
            })
        
        return results

    def fetch_true_color_image(self, bbox: list, date_start: str, date_end: str, width: int = 512, height: int = 512):
        token = self._authenticate()
        if token == "MOCK_TOKEN":
            # Generate a realistic mock image as base64
            import numpy as np
            from PIL import Image
            import io
            
            # Create a simple synthetic green/brown satellite-like image
            grid_x, grid_y = np.mgrid[0:width, 0:height]
            noise = np.sin(grid_x / 20.0) * np.cos(grid_y / 20.0)
            
            r = np.clip(100 + noise * 50, 0, 255).astype(np.uint8)
            g = np.clip(150 + noise * 80, 0, 255).astype(np.uint8)
            b = np.clip(80 + noise * 30, 0, 255).astype(np.uint8)
            
            img_arr = np.stack([r, g, b], axis=-1)
            img = Image.fromarray(img_arr)
            
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            return base64.b64encode(buf.getvalue()).decode("utf-8")

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "image/jpeg"
        }
        
        evalscript = """
        //VERSION=3
        function setup() {
            return {
                input: ["B02", "B03", "B04", "dataMask"],
                output: { bands: 3 }
            };
        }
        
        function evaluatePixel(sample) {
            return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
        }
        """
        
        iso_start = f"{date_start}T00:00:00Z"
        iso_end = f"{date_end}T23:59:59Z"
            
        payload = {
            "input": {
                "bounds": {
                    "bbox": bbox,
                    "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}
                },
                "data": [
                    {
                        "type": "sentinel-2-l2a",
                        "dataFilter": {
                            "timeRange": {
                                "from": iso_start,
                                "to": iso_end
                            }
                        }
                    }
                ]
            },
            "output": {
                "width": width,
                "height": height,
                "responses": [
                    {
                        "identifier": "default",
                        "format": {"type": "image/jpeg"}
                    }
                ]
            },
            "evalscript": evalscript
        }
        
        try:
            resp = requests.post(PROCESS_URL, headers=headers, json=payload, timeout=20)
            if resp.status_code != 200:
                raise Exception(f"Failed to fetch image: {resp.text}")
                
            # Return base64 encoded image
            return base64.b64encode(resp.content).decode("utf-8")
        except Exception as e:
            print(f"Failed to fetch real image: {e}. Falling back to MOCK mode.")
            # Mock fallback if network fails
            import numpy as np
            from PIL import Image
            import io
            
            grid_x, grid_y = np.mgrid[0:width, 0:height]
            noise = np.sin(grid_x / 20.0) * np.cos(grid_y / 20.0)
            r = np.clip(100 + noise * 50, 0, 255).astype(np.uint8)
            g = np.clip(150 + noise * 80, 0, 255).astype(np.uint8)
            b = np.clip(80 + noise * 30, 0, 255).astype(np.uint8)
            img_arr = np.stack([r, g, b], axis=-1)
            img = Image.fromarray(img_arr)
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            return base64.b64encode(buf.getvalue()).decode("utf-8")

copernicus_service = CopernicusService()
