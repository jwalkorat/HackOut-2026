import os
import sys
import json
import requests
import pandas as pd

MENDELEY_DATASET_ID = "y58jknpgs8"
MENDELEY_VERSION = "2"
API_URL = f"https://data.mendeley.com/api-datasets/v2/datasets/{MENDELEY_DATASET_ID}/{MENDELEY_VERSION}"

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_mendeley_dataset_info():
    print(f"Fetching dataset info from Mendeley API: {API_URL}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(API_URL, headers=headers)
    if res.status_code != 200:
        print(f"Failed to fetch dataset metadata: HTTP {res.status_code}")
        print(res.text[:500])
        return None
    return res.json()

def download_file(url, target_path):
    print(f"Downloading {url} to {target_path}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    with requests.get(url, headers=headers, stream=True) as r:
        r.raise_for_status()
        with open(target_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    print(f"Downloaded successfully ({os.path.getsize(target_path)} bytes).")

if __name__ == "__main__":
    info = fetch_mendeley_dataset_info()
    if info:
        print("Dataset title:", info.get("title"))
        files = info.get("files", [])
        print(f"Found {len(files)} file(s) in dataset.")
        for f_info in files:
            file_name = f_info.get("name")
            download_url = f_info.get("contentUrl") or f_info.get("downloadUrl")
            if not download_url and f_info.get("id"):
                download_url = f"https://data.mendeley.com/api-datasets/v2/datasets/{MENDELEY_DATASET_ID}/{MENDELEY_VERSION}/files/{f_info['id']}/content"
            
            if file_name and download_url:
                target_path = os.path.join(DATA_DIR, file_name)
                download_file(download_url, target_path)
