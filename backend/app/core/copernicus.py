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
            raise ValueError("CDSE_CLIENT_ID or CDSE_CLIENT_SECRET environment variables are not set.")
            
        if self.access_token and time.time() < self.token_expiry:
            return self.access_token

        data = {
            "grant_type": "client_credentials",
            "client_id": CDSE_CLIENT_ID,
            "client_secret": CDSE_CLIENT_SECRET
        }
        resp = requests.post(AUTH_URL, data=data)
        if resp.status_code != 200:
            raise Exception(f"Failed to authenticate with Copernicus Data Space: {resp.text}")
            
        token_data = resp.json()
        self.access_token = token_data.get("access_token")
        self.token_expiry = time.time() + token_data.get("expires_in", 3600) - 60
        return self.access_token

    def search_imagery(self, bbox: list, time_start: str, time_end: str, max_cloud_cover: int = 20):
        token = self._authenticate()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "bbox": bbox,
            "datetime": f"{time_start}T00:00:00Z/{time_end}T23:59:59Z",
            "collections": ["sentinel-2-l2a"],
            "limit": 10,
            "filter": {
                "op": "<=",
                "args": [{"property": "eo:cloud_cover"}, max_cloud_cover]
            },
            "filter-lang": "cql2-json"
        }
        
        resp = requests.post(CATALOG_URL, headers=headers, json=payload)
        if resp.status_code != 200:
            raise Exception(f"Failed to search catalog: {resp.text}")
            
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
                                "from": f"{date_start}T00:00:00Z",
                                "to": f"{date_end}T23:59:59Z"
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
        
        resp = requests.post(PROCESS_URL, headers=headers, json=payload)
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch image: {resp.text}")
            
        # Return base64 encoded image
        img_b64 = base64.b64encode(resp.content).decode("utf-8")
        return img_b64

copernicus_service = CopernicusService()
