
// Get the modal and close button elements
const modal = document.getElementById('contactModal');
const closeBtn = document.getElementsByClassName('close')[0];

// Open the modal when the contact button is clicked
document.querySelector('nav ul li a[href="#contact"]').addEventListener('click', function (e) {
    e.preventDefault();
    modal.style.display = 'block';
});

// Close the modal when the close button is clicked
closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function (e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Contact form submission
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                alert('Message sent successfully!');
                form.reset();
                modal.style.display = 'none';
            } else {
                alert('Oops! Something went wrong. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Oops! Something went wrong. Please try again.');
        });
});