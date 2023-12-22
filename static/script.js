// base URL
var apiBaseUrl = 'https://eqfosdyv30.execute-api.us-east-1.amazonaws.com/v1';

// convert form data to a query string
function formDataToQueryString(formData) {
    var params = '';
    for (var pair of formData.entries()) {
        if (pair[1]) {
            params += pair[0] + '=' + encodeURIComponent(pair[1]) + '&';
        }
    }
    return params.slice(0, -1); // remove the last '&'
}

// filter bookings
document.getElementById('filterBookingsForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    getBookings(formData);
};

// get all bookings
document.getElementById('getAllBookingsButton').onclick = function() {
    getBookings();
};

// get bookings (for filter bookings & get all bookings)
function getBookings(formData = null) {
    var url = apiBaseUrl + '/bookings';
    if (formData) {
        url += '?' + formDataToQueryString(formData);
    }
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var resultContainer = document.getElementById('getBookingsResult');
            resultContainer.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(function(booking) {
                    var bookingString = 'Booking ID: ' + booking.booking_id + ', User ID: ' + booking.user_id + ', Host ID:' + booking.host_id + ', Property ID: ' + booking.property_id + ', Total Price: ' + booking.total_price;
                    var bookingDiv = document.createElement('div');
                    bookingDiv.textContent = bookingString;
                    resultContainer.appendChild(bookingDiv);
                });
            } else {
                resultContainer.textContent = 'No (such) bookings were found';
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
        });
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
        return response.text();  // Adjusted to handle plain text response
    })
    .then(function(text) {
        // Display the response text
        alert(text);
    })
    .catch(function(error) {
        alert('Error creating booking');
        console.error('Error:', error);
    });
};



// update a booking (PUT)
document.getElementById('updateBookingForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    // find matching booking
    var bookingId = formData.get('booking_id');
    formData.delete('booking_id');

    var bookingData = {};
    // update each filled field
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
