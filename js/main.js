// Main Application - Skeleton
document.addEventListener('DOMContentLoaded', function() {
    console.log('Project skeleton loaded successfully!');
    
    // Navigation setup
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            console.log('Clicked:', this.textContent);
        });
    });
});
