from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import geoip2.database
import geoip2.errors

app = FastAPI()

# --- IMPORTANT: CORS SETUP ---
# This allows your React app (running on localhost:5173)
# to talk to this backend (running on localhost:8000)
origins = ["http://localhost:5173", "http://163.192.101.22", "http://vmattoo.dev"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- DATA MODELS ---
class Note(BaseModel):
    id: int
    title: str
    date: str
    content: str


# --- ROUTES ---


# Route 1: Serve the Resume File (Inline View)
# CHANGED: Added /api/ prefix to avoid conflict with frontend route
@app.get("/api/resume")
def get_resume():
    # Use absolute path relative to this file's directory
    resume_path = Path(__file__).parent / "resume.pdf"
    if not resume_path.exists():
        raise FileNotFoundError(f"Resume file not found at {resume_path}")
    return FileResponse(
        str(resume_path),
        media_type="application/pdf",
        content_disposition_type="inline",  # <--- THIS IS KEY
    )


@app.get("/")
def read_root():
    return {"status": "System Online"}


# Route 1: Serve the Resume File


# Route 2: Get Notes (JSON Data)
@app.get("/api/notes", response_model=List[Note])
def get_notes():
    # In a real app, you would fetch this from a database (SQLite)
    return [
        {
            "id": 1,
            "title": "Oracle Cloud Architecture",
            "date": "2025-12-20",
            "content": "Deploying a split-stack architecture on ARM instances...",
        },
        {
            "id": 2,
            "title": "React vs. Vanilla JS",
            "date": "2025-12-18",
            "content": "Why component-based state management wins for dashboards...",
        },
    ]


# Initialize GeoLite2 database reader
DB_PATH = Path(__file__).parent / "data" / "GeoLite2-City.mmdb"
geoip_reader = None

def get_geoip_reader():
    """Lazy load the GeoIP database reader"""
    global geoip_reader
    if geoip_reader is None and DB_PATH.exists():
        try:
            geoip_reader = geoip2.database.Reader(str(DB_PATH))
        except Exception as e:
            print(f"Failed to load GeoLite2 database: {e}")
    return geoip_reader

def is_private_ip(ip: str) -> bool:
    """Check if an IP is private/localhost"""
    if ip in ['127.0.0.1', 'localhost', 'unknown']:
        return True
    if ip.startswith('10.') or ip.startswith('192.168.'):
        return True
    if ip.startswith('172.'):
        try:
            parts = ip.split('.')
            if len(parts) >= 2:
                second_octet = int(parts[1])
                if 16 <= second_octet <= 31:
                    return True
        except (ValueError, IndexError):
            pass
    if ip.startswith('169.254.'):
        return True
    if ip in ['::1', '::ffff:127.0.0.1']:
        return True
    return False

# Route 3: Get Geolocation from IP using local GeoLite2 database
@app.get("/api/geolocation")
def get_geolocation(request: Request):
    """
    Get geolocation information from the client's IP address.
    Uses local MaxMind GeoLite2 database - no rate limits!
    """
    # Get client IP from request
    client_ip = request.client.host
    
    # Check for forwarded IP (in case behind proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    # Skip private IPs
    if is_private_ip(client_ip):
        return {
            "ip": client_ip,
            "geo": None
        }
    
    # Use local GeoLite2 database
    reader = get_geoip_reader()
    if not reader:
        return {
            "ip": client_ip,
            "geo": None
        }
    
    try:
        response = reader.city(client_ip)
        
        return {
            "ip": client_ip,
            "geo": {
                "lat": response.location.latitude if response.location.latitude else None,
                "lng": response.location.longitude if response.location.longitude else None,
                "city": response.city.names.get('en', 'Unknown') if response.city else 'Unknown',
                "region": response.subdivisions[0].names.get('en', 'Unknown') if response.subdivisions else 'Unknown',
                "country": response.country.names.get('en', 'Unknown') if response.country else 'Unknown',
                "countryCode": response.country.iso_code if response.country else 'XX',
                "timezone": response.location.time_zone if response.location.time_zone else 'UTC',
                "isp": response.traits.isp or response.traits.organization or 'Unknown' if response.traits else 'Unknown',
                "org": response.traits.organization or 'Unknown' if response.traits else 'Unknown',
            }
        }
    except geoip2.errors.AddressNotFoundError:
        # IP not found in database
        return {
            "ip": client_ip,
            "geo": None
        }
    except Exception as e:
        # Other errors
        print(f"Geolocation lookup error: {e}")
        return {
            "ip": client_ip,
            "geo": None
        }
