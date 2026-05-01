// This function runs every time the user scrolls
// Reader Progess Bar
window.onscroll = function() {
    updateProgressBar();
};

function updateProgressBar() {
    // 1. Find the progress bar element by its ID
    const progressBar = document.getElementById("myBar");
    
    // 2. Calculate how far the user has scrolled
    // winScroll = pixels scrolled down from the top
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    
    // 3. Calculate total scrollable height
    // (Total height of document) - (Height of the visible window)
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // 4. Calculate the percentage
    const scrolled = (winScroll / height) * 100;
    
    // 5. Update the CSS width of the progress bar
    if (progressBar) {
        progressBar.style.width = scrolled + "%";
    }
}

//Triggers an animation when the video figure enters the reader's field of view.
//For SFO chaos video
function initVideoAnimation() {
  const observerOptions = {
    // 0.1 means trigger when 10% of the element is visible
    threshold: 0.1 
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If the element is in view, add the visibility class
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Optional: stop watching once the animation has played once
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Target your figure class
  const videoFig = document.querySelector('.video-embed-fig');
  if (videoFig) {
    observer.observe(videoFig);
  }
}

// Ensure the script runs after the HTML is fully loaded
document.addEventListener("DOMContentLoaded", initVideoAnimation);