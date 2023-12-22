import mysql.connector
from mysql.connector import Error
from typing import List, Dict, Optional

# database services
class BookingsService:
    def __init__(self, db_connection):
        self.db = db_connection

    def get_bookings(self, filters, limit, offset):
        cursor = self.db.cursor(dictionary=True)
        query = "SELECT * FROM Bookings"
        params = []

        # applying filters
        if filters is not None:
            filterlist = []
            for k, v in filters.items():
                if v:
                    # total_price greater than or less than filters
                    if k == "total_price_gt":
                        condition = "total_price > %s"
                        filterlist.append(condition)
                    elif k == "total_price_lt":
                        condition = "total_price < %s"
                        filterlist.append(condition)
                    # all other filters
                    else:
                        condition = k + " = %s"
                        filterlist.append(condition)
                    params.append(v)

            # join all filters and construct the query
            if filterlist:
                query += " WHERE " + " AND ".join(filterlist)
            
        # pagination
        if limit and offset is not None:
            query += " LIMIT %s OFFSET %s"
            params.append(limit)
            params.append(offset)

        # execute select query
        cursor.execute(query, tuple(params))
        bookings = cursor.fetchall()
        cursor.close()
        return bookings


    def create_booking(self, booking_data):
        import requests

        # extract property_id from booking_data
        property_id = booking_data.get('property_id')

        # step 1: Check property availability via GET request
        get_response = requests.get(f"https://e6156-i-am-bezos-402423.ue.r.appspot.com/properties?property_id={property_id}&availability=1")
        if get_response.status_code != 200 or not get_response.json():
            return "Property is not available or does not exist"

        # step 2: Proceed with booking creation
        cursor = self.db.cursor()
        cursor.execute("SELECT MAX(CAST(booking_id AS UNSIGNED)) FROM Bookings")
        max_id = cursor.fetchone()[0]
        next_id_int = 1 if max_id is None else int(max_id) + 1
        next_id = str(next_id_int).zfill(8)

        columns = ['user_id', 'host_id', 'property_id', 'total_price']
        values = [next_id] + [booking_data.get(col) for col in columns]

        query = "INSERT INTO Bookings (booking_id, host_id, user_id, property_id, total_price) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(query, values)
        self.db.commit()
        cnt = cursor.rowcount
        cursor.close()

        # step 3: Update property availability via PUT request if booking was successful
        if cnt > 0:
            property_update_data = {'availability': 0}

            # Sending the PUT request to update the property
            put_response = requests.put(f"https://e6156-i-am-bezos-402423.ue.r.appspot.com/properties/{property_id}",
                                        json=property_update_data)

        
        return "Booking created successfully and availability updated successfully" if cnt > 0 else "Failed to create booking"



    def update_booking(self, booking_id, booking_data):
        cursor = self.db.cursor()
        statements = []
        vals = []

        # get all update fields
        for col in booking_data:
            v = booking_data[col]
            if v:
                statement = col + "=%s"
                statements.append(statement)
                vals.append(v)

        query = "UPDATE Bookings SET " + ", ".join(statements) + " WHERE booking_id=%s"
        vals.append(booking_id)

        # execute update query
        cursor.execute(query, vals)
        self.db.commit()
        cnt = cursor.rowcount
        cursor.close()

        return "Booking updated successfully" if cnt > 0 else "Booking not found"

    def delete_booking(self, booking_id):
        cursor = self.db.cursor()
        query = "DELETE FROM Bookings WHERE booking_id = %s"

        # execute delete query
        cursor.execute(query, (booking_id,))
        self.db.commit()
        cnt = cursor.rowcount
        cursor.close()
        return "Booking deleted successfully" if cnt > 0 else "Booking not found"
