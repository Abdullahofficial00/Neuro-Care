document.getElementById('login-form').addEventListener('submit', function(e) {
    // Add any JavaScript validation here if necessary
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // You can use fetch to send the data to your backend
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        // Handle response data
        if (data.success) {
            window.location.href = "/dashboard";  // Redirect after successful login
        } else {
            alert('Invalid credentials');
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
});
