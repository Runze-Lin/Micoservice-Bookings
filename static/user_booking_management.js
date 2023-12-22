var apiBaseUrl = 'https://eqfosdyv30.execute-api.us-east-1.amazonaws.com/v1';
var urlParams = new URLSearchParams(window.location.search);
var userId = urlParams.get('host_id');


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

// create a booking (POST)
document.getElementById('createBookingForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    var bookingData = {};
    formData.forEach(function(value, key) {
        bookingData[key] = value;
    });

    fetch(apiBaseUrl + '/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        alert('Booking created');
    })
    .catch(function(error) {
        alert('Error creating booking');
        console.error('Error:', error);
    });
};

// delete a booking (DELETE)
document.getElementById('deleteBookingForm').onsubmit = function(event) {
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
};
