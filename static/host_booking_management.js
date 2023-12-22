var apiBaseUrl = 'https://eqfosdyv30.execute-api.us-east-1.amazonaws.com/v1';
var urlParams = new URLSearchParams(window.location.search);
var hostId = urlParams.get('host_id');

// Use the host ID from the URL to fetch bookings when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (hostId) {
        getBookings(hostId);
    }
});
// Add event listener for the 'Fetch Bookings' button click
document.getElementById('fetchBookingsButton').addEventListener('click', function() {
    var hostId = document.getElementById('hostIdInput').value;
    var propertyId = document.getElementById('propertyIdInput').value;
    getBookings(hostId, propertyId);
});

// Function to get bookings based on host ID and property ID
function getBookings(hostId) {
    fetch(apiBaseUrl + '/bookings?host_id=' + encodeURIComponent(hostId))
        .then(response => response.json())
        .then(bookings => displayBookings(bookings))
        .catch(error => console.error('Error:', error));
}

// Function to display bookings in a table
function displayBookings(bookings) {
    var resultContainer = document.getElementById('bookingsResult');
    resultContainer.innerHTML = '';

    if (Array.isArray(bookings) && bookings.length > 0) {
        bookings.forEach(function(booking) {
            var row = resultContainer.insertRow();
            row.insertCell(0).textContent = booking.booking_id;
            row.insertCell(1).textContent = booking.property_id;
            row.insertCell(2).textContent = booking.user_id;
            row.insertCell(3).textContent = booking.total_price;
        });
    } else {
        resultContainer.innerHTML = '<tr><td colspan="3">No bookings found</td></tr>';
    }
}

document.getElementById('createBookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    var bookingData = {};
    formData.forEach(function (value, key) {
        bookingData[key] = value;
    });
    bookingData["host_id"] = hostId;

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
