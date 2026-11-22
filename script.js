document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');

  // Change navbar background/colors on scroll depending on section
  function updateNavColor() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavColor);
  updateNavColor(); // init on load

  // Reveal elements on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.content').forEach((element) => {
    observer.observe(element);
  });
  
  // Trigger reveal for elements already in view on load
  setTimeout(() => {
    document.querySelectorAll('.content').forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            element.classList.add('visible');
        }
    });
    updateNavColor();
  }, 100);

  // --- Starfield Animation ---
  const canvas = document.getElementById('starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = window.innerWidth < 768 ? 1000 : 2500;
    const baseSpeed = 7.5; // Reference speed for 1920px width at 60fps

    function resizeCanvas() {
      const prevWidth = canvas.width || window.innerWidth;
      const prevHeight = canvas.height || window.innerHeight;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (stars.length > 0 && prevWidth > 0 && prevHeight > 0) {
        const scaleX = newWidth / prevWidth;
        const scaleY = newHeight / prevHeight;
        stars.forEach(star => {
          star.x *= scaleX;
          star.y *= scaleY;
          star.z *= scaleX;
          if (star.z <= 0 || star.z > newWidth) {
            star.z = Math.random() * newWidth || 1;
          }
        });
      }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Star {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = (Math.random() - 0.5) * canvas.width * 2;
        this.y = (Math.random() - 0.5) * canvas.height * 2;
        this.z = Math.max(1, Math.random() * canvas.width);
      }
      update(step) {
        this.z -= step;
        if (this.z <= 0 || this.z > canvas.width) {
          this.reset();
          this.z = canvas.width;
        }
      }
      draw() {
        let sx = (this.x / this.z) * canvas.width + canvas.width / 2;
        let sy = (this.y / this.z) * canvas.width + canvas.height / 2;
        let ratio = Math.min(1, Math.max(0, 1 - this.z / canvas.width));
        let radius = ratio * 2;

        if (radius > 0 && sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${ratio})`;
          ctx.fill();
        }
      }
    }

    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }

    let lastTime = performance.now();

    function animateStars(now) {
      const dt = now - lastTime;
      lastTime = now;
      const dtScale = Math.min(dt / (1000 / 60), 3);
      const widthScale = canvas.width / 1920;
      const step = baseSpeed * widthScale * dtScale;

      // Clear with black for the dark background sections
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.update(step);
        star.draw();
      });

      requestAnimationFrame(animateStars);
    }

    requestAnimationFrame(animateStars);
  }
});
