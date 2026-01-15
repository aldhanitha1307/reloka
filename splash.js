// Splash Screen Logic
document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    
    // Durasi splash screen (dalam milidetik)
    const splashDuration = 3000; // 3 detik
    
    // Setelah durasi tertentu, redirect ke signup
    setTimeout(() => {
        // Hide splash screen
        splashScreen.style.display = 'none';
        
        // Redirect ke halaman signup
        window.location.href = 'signup.html';
        
    }, splashDuration);
    
    // Optional: Skip splash screen jika user click (langsung ke signup)
    splashScreen.addEventListener('click', function() {
        splashScreen.style.animation = 'fadeOut 0.3s ease-in-out forwards';
        setTimeout(() => {
            window.location.href = 'signup.html';
        }, 300);
    });
});