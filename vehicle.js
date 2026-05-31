class Vehicle {
    constructor(x, y, dir) {
      this.pos = createVector(x, y);
      this.dir = dir; // 0: Timur, 1: Barat, 2: Selatan, 3: Utara
      this.speed = 0;
      this.maxSpeed = random(2.5, 3.5);
      this.length = 20;
  
      this.stoppedByRed = false;
      this.reactionTimer = 0;
  
      this.turnIntent = random(["S", "L", "R"]); // Straight, Left, Right
      this.hasTurned = false;
    }
  
    update(config, vehicles, tlPhase, trainState) {
      let mustStop = false;
      let isLightRed = tlPhase !== this.dir;
  
      // 1. Calculate relative distance to Traffic Stop Line
      let stopLineDist = Infinity;
      if (this.dir === 0 && this.pos.x < config.LEFT_TL_X) stopLineDist = config.LEFT_TL_X - this.pos.x;
      else if (this.dir === 1 && this.pos.x > config.IX_MAX) stopLineDist = this.pos.x - config.IX_MAX;
      else if (this.dir === 2 && this.pos.y < config.IY_MIN) stopLineDist = config.IY_MIN - this.pos.y;
      else if (this.dir === 3 && this.pos.y > config.IY_MAX) stopLineDist = this.pos.y - config.IY_MAX;
  
      if (isLightRed && stopLineDist > 0 && stopLineDist < 30) {
        mustStop = true;
        this.stoppedByRed = true;
      }
  
      // 2. Human Driver Reaction Delay Handling
      if (!isLightRed && this.stoppedByRed) {
        this.reactionTimer = parseFloat(config.uiReact.value) * config.FPS;
        this.stoppedByRed = false;
      }
      if (this.reactionTimer > 0) {
        this.reactionTimer--;
        mustStop = true;
      }
  
      // 3. Left-Hand Traffic Intersection Turn Routing
      if (!this.hasTurned) {
        this.handleTurningRoute(config);
      }
  
      // 4. Railway Gate Safety Control
      let bridgeActive = config.uiBridge.checked;
      if (!bridgeActive && trainState !== 0) {
        if (this.dir === 0 && this.pos.x < config.RAIL_X - 25) {
          let gateDist = config.RAIL_X - 25 - this.pos.x;
          if (gateDist > 0 && gateDist < 30) mustStop = true;
        } else if (this.dir === 1 && this.pos.x > config.RAIL_X + 25) {
          let gateDist = this.pos.x - (config.RAIL_X + 25);
          if (gateDist > 0 && gateDist < 30) mustStop = true;
        }
      }
  
      // 5. Gridlock Multi-vehicle anti-blocking prevention logic
      let distToIntersection = Infinity;
      if (this.dir === 0) distToIntersection = config.IX_MIN - this.pos.x;
      else if (this.dir === 1) distToIntersection = this.pos.x - config.IX_MAX;
      else if (this.dir === 2) distToIntersection = config.IY_MIN - this.pos.y;
      else if (this.dir === 3) distToIntersection = this.pos.y - config.IY_MAX;
  
      if (!mustStop && distToIntersection > 0 && distToIntersection < 30 && this.turnIntent === "S") {
        let boxBlocked = false;
        if (this.dir === 0) boxBlocked = this.checkAreaBlocks(vehicles, config.IX_MAX, config.IX_MAX + 40, this.pos.y - 10, this.pos.y + 10);
        if (this.dir === 1) boxBlocked = this.checkAreaBlocks(vehicles, config.IX_MIN - 40, config.IX_MIN, this.pos.y - 10, this.pos.y + 10);
        if (this.dir === 2) boxBlocked = this.checkAreaBlocks(vehicles, this.pos.x - 10, this.pos.x + 10, config.IY_MAX, config.IY_MAX + 40);
        if (this.dir === 3) boxBlocked = this.checkAreaBlocks(vehicles, this.pos.x - 10, this.pos.x + 10, config.IY_MIN - 40, config.IY_MIN);
        if (boxBlocked) mustStop = true;
      }
  
      // 6. Intelligent Car Following (Proximity Slowdown Loop)
      for (let other of vehicles) {
        if (other === this) continue;
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (d < 30) {
          let inFront = false;
          if (this.dir === 0 && other.pos.x > this.pos.x && abs(other.pos.y - this.pos.y) < 15) inFront = true;
          else if (this.dir === 1 && other.pos.x < this.pos.x && abs(other.pos.y - this.pos.y) < 15) inFront = true;
          else if (this.dir === 2 && other.pos.y > this.pos.y && abs(other.pos.x - this.pos.x) < 15) inFront = true;
          else if (this.dir === 3 && other.pos.y < this.pos.y && abs(other.pos.x - this.pos.x) < 15) inFront = true;
  
          if (inFront) mustStop = true;
        }
      }
  
      // Linear speed transformations
      if (mustStop) this.speed = max(0, this.speed - 0.5);
      else this.speed = min(this.maxSpeed, this.speed + 0.1);
  
      if (this.dir === 0) this.pos.x += this.speed;
      if (this.dir === 1) this.pos.x -= this.speed;
      if (this.dir === 2) this.pos.y += this.speed;
      if (this.dir === 3) this.pos.y -= this.speed;
    }
  
    handleTurningRoute(config) {
      if (this.dir === 0) {
        if (this.turnIntent === "L" && this.pos.x >= config.ROAD_Y_L2) { this.dir = 3; this.pos.x = config.ROAD_Y_L2; this.hasTurned = true; }
        else if (this.turnIntent === "R" && this.pos.x >= config.ROAD_Y_L1) { this.dir = 2; this.pos.x = config.ROAD_Y_L1; this.hasTurned = true; }
      } else if (this.dir === 1) {
        if (this.turnIntent === "L" && this.pos.x <= config.ROAD_Y_L1) { this.dir = 2; this.pos.x = config.ROAD_Y_L1; this.hasTurned = true; }
        else if (this.turnIntent === "R" && this.pos.x <= config.ROAD_Y_L2) { this.dir = 3; this.pos.x = config.ROAD_Y_L2; this.hasTurned = true; }
      } else if (this.dir === 2) {
        if (this.turnIntent === "L" && this.pos.y >= config.ROAD_X_L1) { this.dir = 0; this.pos.y = config.ROAD_X_L1; this.hasTurned = true; }
        else if (this.turnIntent === "R" && this.pos.y >= config.ROAD_X_L2) { this.dir = 1; this.pos.y = config.ROAD_X_L2; this.hasTurned = true; }
      } else if (this.dir === 3) {
        if (this.turnIntent === "L" && this.pos.y <= config.ROAD_X_L2) { this.dir = 1; this.pos.y = config.ROAD_X_L2; this.hasTurned = true; }
        else if (this.turnIntent === "R" && this.pos.y <= config.ROAD_X_L1) { this.dir = 0; this.pos.y = config.ROAD_X_L1; this.hasTurned = true; }
      }
    }
  
    checkAreaBlocks(vehicles, x1, x2, y1, y2) {
      return vehicles.some((v) => v.pos.x >= x1 && v.pos.x <= x2 && v.pos.y >= y1 && v.pos.y <= y2);
    }
  
    draw() {
      push();
      translate(this.pos.x, this.pos.y);
      if (this.dir === 1) rotate(PI);
      if (this.dir === 2) rotate(HALF_PI);
      if (this.dir === 3) rotate(-HALF_PI);
  
      fill(96, 165, 250);
      stroke(20);
      strokeWeight(1);
      rectMode(CENTER);
      rect(0, 0, this.length, 12, 3);
  
      // Indicator Blinker Rendering
      if (!this.hasTurned && this.turnIntent !== "S") {
        if (frameCount % 16 < 8) {
          fill(255, 165, 0);
          noStroke();
          if (this.turnIntent === "L") ellipse(this.length / 2 - 4, -4, 4, 4);
          if (this.turnIntent === "R") ellipse(this.length / 2 - 4, 4, 4, 4);
        }
      }
  
      // Reaction Delay Brake Indicators
      if (this.reactionTimer > 0) {
        fill(255, 0, 0);
        noStroke();
        ellipse(-this.length / 2, -4, 4, 4);
        ellipse(-this.length / 2, 4, 4, 4);
      }
      pop();
    }
  }