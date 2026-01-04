from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import geoip2.database
import geoip2.errors
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import aiosqlite
import asyncio
from datetime import datetime

app = FastAPI()

# Database path
DB_PATH = Path(__file__).parent / "visitors.db"

# Initialize database on startup
@app.on_event("startup")
async def init_db():
    """Initialize the visitors database"""
    try:
        # Check if file exists and is corrupted, delete it if so
        if DB_PATH.exists():
            try:
                # Try to open and verify it's a valid database using sync sqlite3 first
                import sqlite3
                conn = sqlite3.connect(str(DB_PATH))
                conn.execute("SELECT 1")
                conn.close()
            except (sqlite3.DatabaseError, sqlite3.OperationalError) as e:
                # File exists but is corrupted, delete it
                print(f"Corrupted database file detected ({e}), removing: {DB_PATH}")
                DB_PATH.unlink()
        
        # Create or connect to database
        async with aiosqlite.connect(str(DB_PATH)) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS visitors (
                    ip TEXT PRIMARY KEY,
                    visit_count INTEGER DEFAULT 1,
                    first_visit TEXT,
                    last_visit TEXT,
                    last_referer TEXT
                )
            """)
            await db.commit()
            print(f"Database initialized successfully: {DB_PATH}")
    except Exception as e:
        print(f"Error initializing database: {e}")
        # If database initialization fails, the app will still run but tracking won't work

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
# Try multiple possible paths for the database file
def find_geolite2_database():
    """Find the GeoLite2 database file in common locations"""
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.resolve()
    
    possible_paths = [
        # Relative to this file (most common in deployment)
        script_dir / "data" / "GeoLite2-City.mmdb",
        # Current working directory (for different execution contexts)
        Path.cwd() / "data" / "GeoLite2-City.mmdb",
        Path.cwd() / "backend" / "data" / "GeoLite2-City.mmdb",
        # Deployment path
        Path("/home/opc/backend/data/GeoLite2-City.mmdb"),
        # Development paths
        Path("/home/fuckotheclown/Public/socials/website/yourinfo/data/GeoLite2-City.mmdb"),
        Path("/home/fuckotheclown/Public/socials/website/backend/data/GeoLite2-City.mmdb"),
    ]
    
    print(f"Searching for GeoLite2 database...")
    print(f"Script directory: {script_dir}")
    print(f"Current working directory: {Path.cwd()}")
    
    for db_path in possible_paths:
        if db_path.exists():
            file_size = db_path.stat().st_size / (1024 * 1024)  # Size in MB
            print(f"Found GeoLite2 database at: {db_path} ({file_size:.2f} MB)")
            return db_path
        else:
            print(f"  Not found: {db_path}")
    
    print("ERROR: GeoLite2 database not found in any of these locations:")
    for path in possible_paths:
        print(f"  - {path}")
    return None

geoip_reader = None
DB_PATH = None

def get_geoip_reader():
    """Lazy load the GeoIP database reader"""
    global geoip_reader, DB_PATH
    
    if geoip_reader is None:
        # Find the database file
        if DB_PATH is None:
            DB_PATH = find_geolite2_database()
        
        if DB_PATH and DB_PATH.exists():
            try:
                geoip_reader = geoip2.database.Reader(str(DB_PATH))
                print(f"GeoLite2 database loaded successfully from: {DB_PATH}")
                print(f"Database file size: {DB_PATH.stat().st_size / (1024*1024):.2f} MB")
            except Exception as e:
                print(f"Failed to load GeoLite2 database from {DB_PATH}: {e}")
                import traceback
                traceback.print_exc()
                geoip_reader = None
        else:
            print(f"GeoLite2 database file not found. Searched in multiple locations.")
            if DB_PATH:
                print(f"Expected location: {DB_PATH}")
    
    return geoip_reader

def get_geoip_error_details():
    """Get detailed error information about GeoIP database loading"""
    global DB_PATH
    
    error_details = {
        "database_found": False,
        "database_path": None,
        "database_size_mb": None,
        "searched_paths": [],
        "error_message": None,
        "script_directory": str(Path(__file__).parent.resolve()),
        "working_directory": str(Path.cwd()),
    }
    
    # Get searched paths
    script_dir = Path(__file__).parent.resolve()
    possible_paths = [
        script_dir / "data" / "GeoLite2-City.mmdb",
        Path.cwd() / "data" / "GeoLite2-City.mmdb",
        Path.cwd() / "backend" / "data" / "GeoLite2-City.mmdb",
        Path("/home/opc/backend/data/GeoLite2-City.mmdb"),
        Path("/home/fuckotheclown/Public/socials/website/yourinfo/data/GeoLite2-City.mmdb"),
        Path("/home/fuckotheclown/Public/socials/website/backend/data/GeoLite2-City.mmdb"),
    ]
    
    error_details["searched_paths"] = [str(p) for p in possible_paths]
    
    # Check if database exists
    if DB_PATH is None:
        DB_PATH = find_geolite2_database()
    
    if DB_PATH and DB_PATH.exists():
        error_details["database_found"] = True
        error_details["database_path"] = str(DB_PATH)
        try:
            error_details["database_size_mb"] = round(DB_PATH.stat().st_size / (1024 * 1024), 2)
        except:
            pass
        
        # Try to load it to see if there are any errors
        try:
            test_reader = geoip2.database.Reader(str(DB_PATH))
            test_reader.close()
        except Exception as e:
            error_details["error_message"] = f"Database file exists but failed to load: {str(e)}"
    else:
        error_details["error_message"] = "Database file not found in any searched location"
        if DB_PATH:
            error_details["database_path"] = str(DB_PATH)
    
    return error_details

# Initialize geopy geocoder
geolocator = None

def get_geolocator():
    """Lazy load the geopy geocoder"""
    global geolocator
    if geolocator is None:
        try:
            geolocator = Nominatim(user_agent="vmattoo-dev-trace")
        except Exception as e:
            print(f"Failed to initialize geopy: {e}")
    return geolocator

def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    """Reverse geocode coordinates to approximate street location"""
    try:
        locator = get_geolocator()
        if not locator:
            return None
        
        # Use reverse geocoding with timeout
        location = locator.reverse((lat, lng), timeout=5, exactly_one=True)
        
        if location:
            address = location.raw.get('address', {})
            # Try to get street-level information
            street = address.get('road') or address.get('street') or address.get('pedestrian')
            house_number = address.get('house_number')
            
            if street:
                if house_number:
                    return f"{house_number} {street}"
                return street
            
            # Fallback to suburb/neighborhood if no street
            suburb = address.get('suburb') or address.get('neighbourhood')
            if suburb:
                return suburb
                
            # Last resort: city
            city = address.get('city') or address.get('town')
            if city:
                return city
                
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Geocoding error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected geocoding error: {e}")
        return None
    
    return None

async def track_visitor(ip: str, referer: Optional[str] = None):
    """Track visitor by IP address"""
    try:
        async with aiosqlite.connect(str(DB_PATH)) as db:
            # Check if visitor exists
            cursor = await db.execute(
                "SELECT visit_count, first_visit FROM visitors WHERE ip = ?",
                (ip,)
            )
            row = await cursor.fetchone()
            
            now = datetime.utcnow().isoformat()
            
            if row:
                # Update existing visitor
                visit_count = row[0] + 1
                await db.execute(
                    """UPDATE visitors 
                       SET visit_count = ?, last_visit = ?, last_referer = ?
                       WHERE ip = ?""",
                    (visit_count, now, referer or '', ip)
                )
            else:
                # Insert new visitor
                await db.execute(
                    """INSERT INTO visitors (ip, visit_count, first_visit, last_visit, last_referer)
                       VALUES (?, ?, ?, ?, ?)""",
                    (ip, 1, now, now, referer or '')
                )
            
            await db.commit()
            
            # Get updated visit count
            cursor = await db.execute(
                "SELECT visit_count FROM visitors WHERE ip = ?",
                (ip,)
            )
            row = await cursor.fetchone()
            return row[0] if row else 1
    except Exception as e:
        print(f"Error tracking visitor: {e}")
        return 1

async def get_visitor_info(ip: str):
    """Get visitor information from database"""
    try:
        async with aiosqlite.connect(str(DB_PATH)) as db:
            cursor = await db.execute(
                "SELECT visit_count, last_referer FROM visitors WHERE ip = ?",
                (ip,)
            )
            row = await cursor.fetchone()
            if row:
                return {
                    "visit_count": row[0],
                    "last_referer": row[1] or None
                }
            return {
                "visit_count": 0,
                "last_referer": None
            }
    except Exception as e:
        print(f"Error getting visitor info: {e}")
        return {
            "visit_count": 0,
            "last_referer": None
        }

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
async def get_geolocation(request: Request):
    """
    Get geolocation information from the client's IP address.
    Uses local MaxMind GeoLite2 database - no rate limits!
    Also tracks visitor visits and referer.
    """
    # Get client IP from request
    client_ip = request.client.host
    
    # Check for forwarded IP (in case behind proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    # Get referer from request
    referer = request.headers.get("Referer") or request.headers.get("Referrer")
    
    # Track visitor (even if private IP, we still track it)
    visit_count = await track_visitor(client_ip, referer)
    
    # Get visitor info
    visitor_info = await get_visitor_info(client_ip)
    
    # Skip private IPs for geolocation
    if is_private_ip(client_ip):
        return {
            "ip": client_ip,
            "geo": None,
            "visit_count": visitor_info["visit_count"],
            "referer": visitor_info["last_referer"]
        }
    
    # Use local GeoLite2 database
    reader = get_geoip_reader()
    if not reader:
        # Get detailed error information
        error_details = get_geoip_error_details()
        return {
            "ip": client_ip,
            "geo": None,
            "visit_count": visitor_info["visit_count"],
            "referer": visitor_info["last_referer"],
            "error": "GeoLite2 database not loaded",
            "error_details": error_details
        }
    
    try:
        response = reader.city(client_ip)
        
        lat = response.location.latitude if response.location.latitude else None
        lng = response.location.longitude if response.location.longitude else None
        
        # Reverse geocode to get approximate street location
        street_location = None
        if lat and lng:
            try:
                street_location = reverse_geocode(lat, lng)
            except Exception as e:
                print(f"Reverse geocoding error: {e}")
                street_location = None
        
        return {
            "ip": client_ip,
            "geo": {
                "lat": lat,
                "lng": lng,
                "city": response.city.names.get('en', 'Unknown') if response.city else 'Unknown',
                "region": response.subdivisions[0].names.get('en', 'Unknown') if response.subdivisions else 'Unknown',
                "country": response.country.names.get('en', 'Unknown') if response.country else 'Unknown',
                "countryCode": response.country.iso_code if response.country else 'XX',
                "timezone": response.location.time_zone if response.location.time_zone else 'UTC',
                "isp": response.traits.isp or response.traits.organization or 'Unknown' if response.traits else 'Unknown',
                "org": response.traits.organization or 'Unknown' if response.traits else 'Unknown',
                "streetLocation": street_location,  # Approximate street location from reverse geocoding
            },
            "visit_count": visitor_info["visit_count"],
            "referer": visitor_info["last_referer"]
        }
    except geoip2.errors.AddressNotFoundError as e:
        # IP not found in database
        print(f"IP not found in GeoLite2 database: {client_ip} - {e}")
        return {
            "ip": client_ip,
            "geo": None,
            "visit_count": visitor_info["visit_count"],
            "referer": visitor_info["last_referer"],
            "error": "IP not found in database"
        }
    except Exception as e:
        # Other errors
        print(f"Geolocation lookup error for IP {client_ip}: {e}")
        import traceback
        traceback.print_exc()
        return {
            "ip": client_ip,
            "geo": None,
            "visit_count": visitor_info["visit_count"],
            "referer": visitor_info["last_referer"],
            "error": str(e)
        }
