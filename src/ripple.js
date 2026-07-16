/* Interactive Particle Grid Ripple Engine - Shika Yoga & Batcloud */

export class RippleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ripples = [];
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, active: false };
    this.lastMouse = { x: -1000, y: -1000 };
    
    // Grid configuration
    this.spacing = 30; // distance between particles
    this.maxRipples = 10;
    
    this.resize();
    this.initParticles();
    
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const cols = Math.floor(this.width / this.spacing) + 2;
    const rows = Math.floor(this.height / this.spacing) + 2;
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const baseX = i * this.spacing - 10;
        const baseY = j * this.spacing - 10;
        this.particles.push({
          baseX: baseX,
          baseY: baseY,
          x: baseX,
          y: baseY,
          vx: 0,
          vy: 0,
          size: 1.5,
          alpha: 0.15,
          // Random offset for float effect
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: 0.2 + Math.random() * 0.3
        });
      }
    }
  }

  // Create a ripple at specific coordinates
  createRipple(x, y, isBig = false) {
    if (this.ripples.length >= this.maxRipples) {
      this.ripples.shift();
    }
    
    this.ripples.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: isBig ? Math.max(this.width, this.height) * 0.8 : 220,
      speed: isBig ? 6 : 4.5,
      amplitude: isBig ? 45 : 12,
      width: isBig ? 120 : 60,
      life: 1.0,
      decay: isBig ? 0.008 : 0.02
    });
  }

  setMouse(x, y, active) {
    this.mouse.x = x;
    this.mouse.y = y;
    this.mouse.active = active;
  }

  update() {
    // 1. Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed;
      r.life -= r.decay;
      if (r.life <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // 2. Add subtle hover ripple when mouse moves
    if (this.mouse.active) {
      const dx = this.mouse.x - this.lastMouse.x;
      const dy = this.mouse.y - this.lastMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 15) {
        // Create standard small ripple on mouse path
        this.createRipple(this.mouse.x, this.mouse.y, false);
        this.lastMouse.x = this.mouse.x;
        this.lastMouse.y = this.mouse.y;
      }
    }

    // 3. Update particles
    const time = Date.now() * 0.001;
    this.particles.forEach(p => {
      let dx = 0;
      let dy = 0;
      
      // Accumulate displacements from all active ripples
      this.ripples.forEach(r => {
        const rx = p.baseX - r.x;
        const ry = p.baseY - r.y;
        const dist = Math.sqrt(rx * rx + ry * ry);
        
        if (dist > 0) {
          const diff = dist - r.radius;
          // Check if particle falls within the wavefront
          if (diff > -r.width && diff < r.width) {
            const factor = Math.sin((diff / r.width) * Math.PI);
            const displacement = r.amplitude * factor * r.life;
            dx += (rx / dist) * displacement;
            dy += (ry / dist) * displacement;
          }
        }
      });

      // Add gentle drift (simulating calm floating dust)
      p.driftAngle += 0.01;
      const driftX = Math.sin(p.driftAngle) * p.driftSpeed;
      const driftY = Math.cos(p.driftAngle) * p.driftSpeed;

      // Target position
      const targetX = p.baseX + dx + driftX;
      const targetY = p.baseY + dy + driftY;

      // Smooth interpolation to target position
      p.x += (targetX - p.x) * 0.1;
      p.y += (targetY - p.y) * 0.1;

      // Glow when displaced
      const totalDisplacement = Math.sqrt(dx * dx + dy * dy);
      p.alpha = 0.15 + Math.min(totalDisplacement / 25, 0.7);
      p.size = 1.5 + Math.min(totalDisplacement / 10, 1.5);
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw all particles
    this.particles.forEach(p => {
      // Calculate color blend: rose-pink when highly displaced, soft violet when calm
      const displacement = Math.sqrt(
        Math.pow(p.x - p.baseX, 2) + Math.pow(p.y - p.baseY, 2)
      );
      
      this.ctx.beginPath();
      
      if (displacement > 2) {
        // Active rose/violet glowing particle blend
        const pinkRatio = Math.min(displacement / 20, 1);
        const r = Math.floor(236 * pinkRatio + 139 * (1 - pinkRatio));
        const g = Math.floor(72 * pinkRatio + 92 * (1 - pinkRatio));
        const b = Math.floor(153 * pinkRatio + 246 * (1 - pinkRatio));
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 1.15})`;
      } else {
        // Muted background particles: soft violet
        this.ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha * 0.95})`;
      }
      
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw visible concentric ring overlays for big mouse clicks
    this.ripples.forEach(r => {
      if (r.amplitude > 15) { // Only draw lines for large ripples
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        
        // Rose pink ring
        this.ctx.strokeStyle = `rgba(236, 72, 153, ${r.life * 0.16})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Secondary soft violet ring following behind
        if (r.radius > r.width * 0.5) {
          this.ctx.beginPath();
          this.ctx.arc(r.x, r.y, r.radius - r.width * 0.4, 0, Math.PI * 2);
          
          this.ctx.strokeStyle = `rgba(139, 92, 246, ${r.life * 0.09})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    });
  }

  // Animation Loop
  tick() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.tick());
  }
}
