from fastapi import FastAPI, Request, HTTPException
import mysql.connector
from typing import Optional
from bookings import BookingsService  # Assuming a similar service class for bookings
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from middleservice import LoggingMiddleware

app = FastAPI()
app.add_middleware(LoggingMiddleware)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# setting up db connection
def setup_db_connection(host, user, pwd, db, port):
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            passwd=pwd,
            database=db,
            port=port)
        print("Database connected successfully!")
    except mysql.connector.Error as err:
        print(f"Error: '{err}'")
        raise HTTPException(status_code=500, detail="Database connection failed")
    return conn

# initialize db connection and BookingsService
conn = setup_db_connection("database-1.cjcvwqrysug2.us-east-2.rds.amazonaws.com", "admin", "dbuserdbuser", "booking", 3306)
bookings_svc = BookingsService(conn)

# api endpoints
@app.get("/")       # static page
async def root():
    return RedirectResponse(url="https://nestly6156.s3.us-east-2.amazonaws.com/bookings_static/index.html")

@app.get("/booking_management_host/{host_id}")
async def booking_management_host(host_id: str):
    return RedirectResponse(url=f"https://nestly6156.s3.us-east-2.amazonaws.com/bookings_static/booking_management_host.html?host_id={host_id}")


@app.get("/user_booking_management/{host_id}")
async def user_booking_management(host_id: str):
    return RedirectResponse(url=f"https://nestly6156.s3.us-east-2.amazonaws.com/bookings_static/user_booking_management.html?host_id={host_id}")


@app.get("/bookings")           # get bookings
async def get_bookings(booking_id: Optional[str] = None, 
                    user_id: Optional[int] = None, 
                    host_id: Optional[int] = None,
                    property_id: Optional[int] = None, 
                    total_price: Optional[float] = None, 
                    total_price_gt: Optional[float] = None, 
                    total_price_lt: Optional[float] = None, 
                    limit: Optional[int] = None, 
                    offset: Optional[int] = None):
    filters = {
        "booking_id": booking_id,
        "user_id": user_id,
        "host_id": host_id,
        "property_id": property_id,
        "total_price": total_price,
        "total_price_gt": total_price_gt,
        "total_price_lt": total_price_lt
    }
    query = {k: v for k, v in filters.items() if v}  # simple search with support for greater than and less than filters
    return bookings_svc.get_bookings(query, limit, offset)

@app.get("/bookings/{user_id}")  # getting bookings by user_id
async def get_bookings_by_user(user_id: int, limit: Optional[int] = None, offset: Optional[int] = None):
    user_bookings = bookings_svc.get_bookings({"user_id": user_id}, limit, offset)
    host_bookings = bookings_svc.get_bookings({"host_id": user_id}, limit, offset)

    # display both user_bookings and host_bookings of this user_id
    all_bookings = {b['booking_id']: b for b in user_bookings + host_bookings}.values()

    return list(all_bookings)


@app.post("/bookings")          # create booking
async def create_booking(request: Request):
    booking_data = await request.json()
    return bookings_svc.create_booking(booking_data)

@app.put("/bookings/{booking_id}")          # update booking
async def update_booking(booking_id: str, request: Request):
    booking_data = await request.json()
    return bookings_svc.update_booking(booking_id, booking_data)

@app.delete("/bookings/{booking_id}")           # delete booking
async def delete_booking(booking_id: str):
    return bookings_svc.delete_booking(booking_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012)
