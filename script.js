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

// Get the latest bytes modal and close button elements
const latestModal = document.getElementById('latestModal');
const latestCloseBtn = latestModal.querySelector('.close');
const readLatestBtn = document.getElementById('readLatestBtn');

// Open the latest bytes modal when the "Read Latest" button is clicked
readLatestBtn.addEventListener('click', function (e) {
    e.preventDefault();
    latestModal.style.display = 'block';
});

// Close the latest bytes modal when the close button is clicked
latestCloseBtn.addEventListener('click', function () {
    latestModal.style.display = 'none';
});

// Close the latest bytes modal when clicking outside the modal content
window.addEventListener('click', function (e) {
    if (e.target === latestModal) {
        latestModal.style.display = 'none';
    }
});

// Get the article modals and close buttons
const articleModals = document.querySelectorAll('.modal');
const articleCloseBtns = document.querySelectorAll('.close');

// Open the article modal when the "Read More" button is clicked
document.querySelectorAll('.read-more-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const articleNumber = this.getAttribute('data-article');
        const articleModal = document.getElementById(`articleModal${articleNumber}`);
        const articleTitle = document.getElementById(`articleTitle${articleNumber}`);
        const articleImage = document.getElementById(`articleImage${articleNumber}`);
        const articleContent = document.getElementById(`articleContent${articleNumber}`);

        // Set the article title, image, and content
        articleTitle.textContent = this.parentElement.querySelector('h3').textContent;
        articleImage.src = this.parentElement.getAttribute('data-image');
        articleContent.textContent = this.parentElement.querySelector('p').textContent;

        articleModal.style.display = 'block';
    });
});

// Close the article modal when the close button is clicked
articleCloseBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        this.closest('.modal').style.display = 'none';
    });
});

// Close the article modal when clicking outside the modal content
window.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});