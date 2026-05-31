// Central Shared System Engine State Config
const SIM_CONFIG = {
    FPS: 30,
    // Dynamic Map anchors relative to Canvas width/height (Calculated in setup)
    IX_MIN: 0, IX_MAX: 0,
    IY_MIN: 0, IY_MAX: 0,
    RAIL_X: 0, LEFT_TL_X: 0,
    ROAD_X_L1: 0, ROAD_X_L2: 0,
    ROAD_Y_L1: 0, ROAD_Y_L2: 0,
    // DOM element nodes
    uiVol: null, uiKereta: null, uiReact: null, uiBridge: null, uiTimer: null
  };
  
  let tlPhase = 0;
  let tlTimer = 600;
  let trainState = 0;
  let trainTimer = 600;
  let trainY = -200;
  let vehicles = [];
  
  function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent("canvas-container");
    frameRate(SIM_CONFIG.FPS);
  
    // Dynamically calculate map dimensions structurally instead of hardcoding
    SIM_CONFIG.IX_MIN = width * 0.54;
    SIM_CONFIG.IX_MAX = width * 0.62;
    SIM_CONFIG.IY_MIN = height * 0.433;
    SIM_CONFIG.IY_MAX = height * 0.566;
    SIM_CONFIG.RAIL_X = width * 0.47;
    SIM_CONFIG.LEFT_TL_X = width * 0.40;
  
    // Internal lane vectors mapped to screen coordinate positions
    SIM_CONFIG.ROAD_X_L1 = SIM_CONFIG.IY_MIN + 20; // 280
    SIM_CONFIG.ROAD_X_L2 = SIM_CONFIG.IY_MIN + 60; // 320
    SIM_CONFIG.ROAD_Y_L1 = SIM_CONFIG.IX_MIN + 60; // 600
    SIM_CONFIG.ROAD_Y_L2 = SIM_CONFIG.IX_MIN + 20; // 560
  
    // Bind Control Nodes
    SIM_CONFIG.uiVol = document.getElementById("slVol");
    SIM_CONFIG.uiKereta = document.getElementById("slKereta");
    SIM_CONFIG.uiReact = document.getElementById("slReact");
    SIM_CONFIG.uiBridge = document.getElementById("chkBridge");
    SIM_CONFIG.uiTimer = document.getElementById("slTimer");
  
    // Dynamic Label Setup
    SIM_CONFIG.uiVol.oninput = () => (document.getElementById("valVol").innerText = SIM_CONFIG.uiVol.value > 10 ? "Padat" : SIM_CONFIG.uiVol.value < 4 ? "Sepi" : "Sedang");
    SIM_CONFIG.uiKereta.oninput = () => (document.getElementById("valKereta").innerText = SIM_CONFIG.uiKereta.value + " Detik");
    SIM_CONFIG.uiReact.oninput = () => (document.getElementById("valReact").innerText = SIM_CONFIG.uiReact.value + " Detik");
    SIM_CONFIG.uiTimer.oninput = () => (document.getElementById("valTimer").innerText = SIM_CONFIG.uiTimer.value + " Detik");
  }
  
  function draw() {
    background(30);
    updateSystem();
    drawInfrastructure();
    spawnVehicles();
    
    // Update & Draw Vehicles loop
    for (let i = vehicles.length - 1; i >= 0; i--) {
      vehicles[i].update(SIM_CONFIG, vehicles, tlPhase, trainState);
      vehicles[i].draw();
  
      // Splice vehicle if boundary limits are crossed
      let p = vehicles[i].pos;
      if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
        vehicles.splice(i, 1);
      }
    }
  
    if (trainState === 2) drawTrain();
    drawUIOverlays();
  }
  
  function updateSystem() {
    // Traffic Signal Step Tick
    tlTimer--;
    if (tlTimer <= 0) {
      tlPhase = (tlPhase + 1) % 4;
      tlTimer = parseInt(SIM_CONFIG.uiTimer.value) * SIM_CONFIG.FPS;
    }
  
    // Train Scheduling Automation State Routing Matrix
    if (trainState === 0) {
      trainTimer--;
      if (trainTimer <= 0) { trainState = 1; trainTimer = 90; }
    } else if (trainState === 1) {
      trainTimer--;
      if (trainTimer <= 0) { trainState = 2; trainY = -300; }
    } else if (trainState === 2) {
      trainY += 4;
      if (trainY > height + 300) {
        trainState = 0;
        trainTimer = parseInt(SIM_CONFIG.uiKereta.value) * SIM_CONFIG.FPS;
      }
    }
  }
  
  function spawnVehicles() {
    let rate = parseInt(SIM_CONFIG.uiVol.value) / 100;
    if (random() < rate) attemptSpawn(0, SIM_CONFIG.ROAD_X_L1, 0); 
    if (random() < rate) attemptSpawn(width, SIM_CONFIG.ROAD_X_L2, 1); 
    if (random() < rate) attemptSpawn(SIM_CONFIG.ROAD_Y_L1, 0, 2); 
    if (random() < rate) attemptSpawn(SIM_CONFIG.ROAD_Y_L2, height, 3); 
  }
  
  function attemptSpawn(x, y, dir) {
    let occupied = vehicles.some((v) => dist(x, y, v.pos.x, v.pos.y) < 30);
    if (!occupied) vehicles.push(new Vehicle(x, y, dir));
  }
  
  function drawInfrastructure() {
    noStroke();
    fill(80);
    rect(0, SIM_CONFIG.IY_MIN, width, SIM_CONFIG.IY_MAX - SIM_CONFIG.IY_MIN);
    rect(SIM_CONFIG.IX_MIN, 0, SIM_CONFIG.IX_MAX - SIM_CONFIG.IX_MIN, height);
  
    fill(90, 90, 60);
    rect(SIM_CONFIG.IX_MIN, SIM_CONFIG.IY_MIN, SIM_CONFIG.IX_MAX - SIM_CONFIG.IX_MIN, SIM_CONFIG.IY_MAX - SIM_CONFIG.IY_MIN);
  
    stroke(200);
    strokeWeight(2);
    for (let x = 0; x < width; x += 30) if (x < SIM_CONFIG.IX_MIN || x > SIM_CONFIG.IX_MAX) line(x, height * 0.5, x + 15, height * 0.5);
    for (let y = 0; y < height; y += 30) if (y < SIM_CONFIG.IY_MIN || y > SIM_CONFIG.IY_MAX) line(width * 0.58, y, width * 0.58, y + 15);
  
    // Left-Hand Stop Lines
    stroke(255);
    strokeWeight(3);
    line(SIM_CONFIG.LEFT_TL_X, SIM_CONFIG.IY_MIN, SIM_CONFIG.LEFT_TL_X, height * 0.5);
    line(SIM_CONFIG.IX_MAX, height * 0.5, SIM_CONFIG.IX_MAX, SIM_CONFIG.IY_MAX);
    line(width * 0.58, SIM_CONFIG.IY_MIN, SIM_CONFIG.IX_MAX, SIM_CONFIG.IY_MIN);
    line(SIM_CONFIG.IX_MIN, SIM_CONFIG.IY_MAX, width * 0.58, SIM_CONFIG.IY_MAX);
  
    if (!SIM_CONFIG.uiBridge.checked) drawRailwayBase();
  }
  
  function drawRailwayBase() {
    noStroke();
    fill(20);
    rect(SIM_CONFIG.RAIL_X - 15, 0, 30, height);
    stroke(150);
    strokeWeight(3);
    line(SIM_CONFIG.RAIL_X - 8, 0, SIM_CONFIG.RAIL_X - 8, height);
    line(SIM_CONFIG.RAIL_X + 8, 0, SIM_CONFIG.RAIL_X + 8, height);
    stroke(100);
    strokeWeight(4);
    for (let y = 0; y < height; y += 15) line(SIM_CONFIG.RAIL_X - 15, y, SIM_CONFIG.RAIL_X + 15, y);
  
    strokeWeight(4);
    stroke(trainState !== 0 ? "#ef4444" : "#fff");
    line(SIM_CONFIG.RAIL_X - 25, SIM_CONFIG.IY_MIN, SIM_CONFIG.RAIL_X - 25, SIM_CONFIG.IY_MAX);
    line(SIM_CONFIG.RAIL_X + 25, SIM_CONFIG.IY_MIN, SIM_CONFIG.RAIL_X + 25, SIM_CONFIG.IY_MAX);
  }
  
  function drawTrain() {
    push();
    fill(220, 38, 38);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(SIM_CONFIG.RAIL_X, trainY, 24, 400);
    fill(200);
    noStroke();
    for (let i = -180; i < 180; i += 30) rect(SIM_CONFIG.RAIL_X, trainY + i, 16, 15);
    pop();
  }
  
  function drawUIOverlays() {
    if (SIM_CONFIG.uiBridge.checked) {
      drawRailwayBase();
      if (trainState === 2) drawTrain();
  
      noStroke();
      fill(120);
      rect(SIM_CONFIG.RAIL_X - 40, SIM_CONFIG.IY_MIN - 10, 80, SIM_CONFIG.IY_MAX - SIM_CONFIG.IY_MIN + 20);
  
      fill(0, 0, 0, 100);
      rect(SIM_CONFIG.RAIL_X + 40, SIM_CONFIG.IY_MIN - 5, 10, SIM_CONFIG.IY_MAX - SIM_CONFIG.IY_MIN + 15);
  
      stroke(255);
      strokeWeight(2);
      line(SIM_CONFIG.RAIL_X - 40, height * 0.5, SIM_CONFIG.RAIL_X + 40, height * 0.5);
    }
  
    // Map Signal Lamps dynamically
    drawLight(SIM_CONFIG.LEFT_TL_X - 10, SIM_CONFIG.IY_MIN + 5, tlPhase === 0);
    drawLight(SIM_CONFIG.IX_MAX + 10, SIM_CONFIG.IY_MAX - 5, tlPhase === 1);
    drawLight(SIM_CONFIG.IX_MAX - 5, SIM_CONFIG.IY_MIN - 10, tlPhase === 2);
    drawLight(SIM_CONFIG.IX_MIN + 5, SIM_CONFIG.IY_MAX + 10, tlPhase === 3);
  
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(24);
    text(ceil(tlTimer / SIM_CONFIG.FPS), width * 0.58, SIM_CONFIG.IY_MIN + 30);
  }
  
  function drawLight(x, y, isGreen) {
    fill(20);
    stroke(100);
    strokeWeight(2);
    ellipse(x, y, 16, 16);
    fill(isGreen ? "#22c55e" : "#ef4444");
    noStroke();
    ellipse(x, y, 12, 12);
  }