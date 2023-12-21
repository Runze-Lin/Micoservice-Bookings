var apiBaseUrl = window.location.origin;
var pathArray = window.location.pathname.split('/');
var userId = pathArray[pathArray.length - 1];

// Use the user ID from the URL to fetch bookings when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (userId) {
        getUserBookings(userId);
    }
});

// Add event listener for the 'Fetch User Bookings' button click
document.getElementById('fetchUserBookingsButton').addEventListener('click', function() {
    var userId = document.getElementById('userIdInput').value;
    getUserBookings(userId);
});

// Function to get bookings based on user ID
function getUserBookings(userId) {
    fetch(apiBaseUrl + '/bookings?user_id=' + encodeURIComponent(userId))
        .then(response => response.json())
        .then(bookings => displayUserBookings(bookings))
        .catch(error => console.error('Error:', error));
}

// Function to display user bookings in a table
function displayUserBookings(bookings) {
    var resultContainer = document.getElementById('userBookingsResult');
    resultContainer.innerHTML = '';

    if (Array.isArray(bookings) && bookings.length > 0) {
        bookings.forEach(function(booking) {
            var row = resultContainer.insertRow();
            row.insertCell(0).textContent = booking.booking_id;
            row.insertCell(1).textContent = booking.property_id;
            row.insertCell(2).textContent = booking.total_price;
        });
    } else {
        resultContainer.innerHTML = '<tr><td colspan="4">No bookings found</td></tr>';
    }
}

document.getElementById('createBookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    var bookingData = {};
    formData.forEach(function (value, key) {
        bookingData[key] = value;
    });

    fetch(apiBaseUrl + '/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            alert('Booking created');
        })
        .catch(function (error) {
            alert('Error creating booking');
            console.error('Error:', error);
        });
});

// UPDATE Booking
document.getElementById('editBookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    var bookingId = formData.get('booking_id');
    formData.delete('booking_id');
    var bookingData = {};
    formData.forEach(function(value, key) {
        if (value) bookingData[key] = value;
    });

    fetch(apiBaseUrl + '/bookings/' + bookingId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        alert('Booking updated');
    })
    .catch(function(error) {
        alert('Error updating booking');
        console.error('Error:', error);
    });
});

document.getElementById('deleteBookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var bookingId = document.getElementById('delete-booking-id').value;
    fetch(apiBaseUrl + '/bookings/' + bookingId, {
        method: 'DELETE',
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        alert('Booking deleted');
    })
    .catch(function(error) {
        alert('Error deleting booking');
        console.error('Error:', error);
    });
});