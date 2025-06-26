   let fireCooldown = 0;
let player = {
  x: 300,
  y: 300,
  w: 40,
  h: 40,
  color: 'cyan',
  speed: 4,
  damage: 1,
  isDashing: false,
  dashCooldown: 0,
  dashTime: 0,
  dashDir: { x: 0, y: 0 },
  dashTrail: []
};


    let bullets = [];
    let enemies = [];
    let enemyBullets = [];
    let hp = 100, maxHP = 100, score = 0, level = 1, wave = 0, upgradePoints = 0, skillPoints = 0;

    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let keys = {};
    let mouseX = 0, mouseY = 0;
    let waveTimer = 0;
    let particles = [];
    let mouseDown = false;
    let fireRateMultiplier = 1.0;
    let luck = 1.0;
    let droppedItems = [];
    let statUpgrades = {
      speed: 0,
      damage: 0,
      maxHP: 0,
      reload: 0,
      luck: 0
};
      
const UPGRADE_CAP = 100;
      const UPGRADE_CAPS = {
     speed: 100,
     damage: 50,
     maxHP: 25,
     reload: 30,
     luck: 50
};


        
    const dropChances = {
      shotgun: 0.01,
      burst: 0.008,      
      auto: 0.01,        
      laser: 0.001,     
      missile: 0.005,   
      boomerang: 0.005,
      potion: 0.05      
    };

      const enemyTypes = {
  default: {
    unlockWave: 1,
    spawnRate: wave => 5 + wave * 0.5,
    create: () => ({ hp: 3 + wave, speed: 1, type: 'default' })
  },
  zoomie: {
    unlockWave: 5,
    spawnRate: wave => wave >= 5 ? Math.floor(wave / 2) : 0,
    create: () => ({ hp: 2 + wave, speed: 2, type: 'zoomie' })
  },
  tanklet: {
    unlockWave: 7,
    spawnRate: wave => wave >= 7 ? Math.floor(wave / 3) : 0,
    create: () => ({ hp: 30 + wave, speed: 0.5, w: 50, h: 50, type: 'tanklet' })
  },
  spitter: {
    unlockWave: 9,
    spawnRate: wave => wave >= 9 ? Math.floor(wave / 4) : 0,
    create: () => ({ hp: 5 + wave, speed: 1, fireCooldown: 60, type: 'spitter' })
  },
  boomling: {
    unlockWave: 12,
    spawnRate: wave => wave >= 12 ? Math.floor(wave / 5) : 0,
    create: () => ({ hp: 1 + wave, speed: 1.5, type: 'boomling' })
  }
};


      function createParticle(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x, y,
      dx: Math.random() * 4 - 2,
      dy: Math.random() * 4 - 2,
      life: 30,
      color
    });
  }
}

function spawnEnemy() {
  for (let type in enemyTypes) {
    const config = enemyTypes[type];
    if (wave >= config.unlockWave) {
      const count = config.spawnRate(wave);
          console.log(`Spawning ${count} of ${type}`); 
      for (let i = 0; i < count; i++) {
        const base = config.create();
        enemies.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          w: base.w || 30,
          h: base.h || 30,
          dx: 0,
          dy: 0,
          ...base
        });
      }
    }
  }

  if (wave % 10 === 0) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      w: 60,
      h: 60,
      dx: 0,
      dy: 0,
      hp: 100 + wave * 5,
      boss: true,
      type: "boss",
      speed: 1.2
    });
  }
}


function loadGame() {
  if (!inventory.includes('pistol')) {
    inventory.push('pistol');
    currentWeapon = 'pistol';
    drawInventory();
  }
}

      
    const weaponsData = {
      pistol: { name: "Pistol", fireRate: 20, type: "single" },
      shotgun: { name: "Shotgun", fireRate: 40, type: "spread" },
      burst: { name: "Burst", fireRate: 30, type: "burst3" },
      auto: { name: "Auto", fireRate: 5, type: "auto" },
      laser: { name: "Laser", fireRate: 100, type: "laser" },
      missile: { name: "Missile", fireRate: 60, type: "missile" },
      boomerang: { name: "-Rang", fireRate: 60, type: "boomerang" }  
    };
      
    let inventory = [], currentWeapon = null;
    let showInventory = false, menuVisible = false;
    function drawInventory() {
      const invEl = document.getElementById("inventory");
      const list = document.getElementById("weaponList");
      list.innerHTML = "";
      inventory.forEach(w => {
        const div = document.createElement("div");
        div.className = "weapon-icon" + (w === currentWeapon ? " active" : "");
        div.textContent = weaponsData[w]?.name || w;
        div.onclick = () => { currentWeapon = w; drawInventory(); };
        list.appendChild(div);
      });
    }
      
    function toggleInventory() {
      showInventory = !showInventory;
      document.getElementById("inventory").style.display = showInventory ? "block" : "none";
      drawInventory();
    }
      
function itemDrop(x, y) {
  const keys = Object.keys(dropChances);
  const filtered = keys.filter(k => {
        if (['potion'].includes(k)) return true;
    return !inventory.includes(k);
    });
  const shuffled = filtered.sort(() => Math.random() - 0.5);

  console.log("Checking drop order:", shuffled);
    
for (let item of shuffled) {
  if (Math.random() < dropChances[item] * luck) {
    droppedItems.push({
      x,
      y,
      w: 60,
      h: 30,
      item,
      timer: 600
    });
    console.log(`Dropped: ${item}`);
    break;
  }
}
}





canvas.addEventListener('mousedown', e => {
  mouseDown = true;
    shootAt(mouseX, mouseY)
});

canvas.addEventListener('mouseup', e => {
  mouseDown = false;
});
      canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});


function shootAt(x, y) {
  if (!currentWeapon) return;
  const weapon = weaponsData[currentWeapon];
  let angle = Math.atan2(y - (player.y + player.h / 2), x - (player.x + player.w / 2));

  if (weapon.type === 'laser') {
    createLaser(angle);
  } else {
    if (fireCooldown > 0) return;
    fireCooldown = Math.floor(weapon.fireRate * fireRateMultiplier);

    if (weapon.type === 'single' || weapon.type === 'auto') createBullet(angle);
    else if (weapon.type === 'spread') for (let i = -1; i <= 1; i++) createBullet(angle + i * 0.2);
    else if (weapon.type === 'burst3') for (let i = 0; i < 3; i++) setTimeout(() => createBullet(angle), i * 100);
    else if (weapon.type === 'missile') createMissile(angle);
else if (weapon.type === 'boomerang') createBoomerang(x, y);

  }
}



function createBullet(angle) {
      bullets.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        w: 10,
        h: 10,
        dx: Math.cos(angle) * 6,
        dy: Math.sin(angle) * 6,
        color: 'yellow'
      });
    }
      
    function createLaser(angle) {
      bullets.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        w: 1,
        h: 3,
        dx: Math.cos(angle) * 10,
        dy: Math.sin(angle) * 10,
        color: 'lime',
        laser: true
      });
    }
      
    function createMissile(angle) {
      bullets.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        w: 20,
        h: 20,
        dx: Math.cos(angle) * 4,
        dy: Math.sin(angle) * 4,
        color: 'orange',
        explosive: true
      });
    }


      function createBoomerang(targetX, targetY) {
  const angle = Math.atan2(
    targetY - (player.y + player.h / 2),
    targetX - (player.x + player.w / 2)
  );

  const speed = 6;
  const distance = 300;

  const peakX = player.x + player.w / 2 + Math.cos(angle) * distance;
  const peakY = player.y + player.h / 2 + Math.sin(angle) * distance;

  bullets.push({
    x: player.x + player.w / 2,
    y: player.y + player.h / 2,
    peakX,
    peakY,
    state: "out",
    speed,
    dx: 0,
    dy: 0,
    w: 20,
    h: 20,
    color: "white",
    boomerang: true
  });
}


      function fireEnemyBullet(x, y) {
  const angle = Math.atan2(player.y + player.h / 2 - y, player.x + player.w / 2 - x);
  enemyBullets.push({
    x,
    y,
    dx: Math.cos(angle) * 3,
    dy: Math.sin(angle) * 3,
    w: 8,
    h: 8,
    color: 'red'
  });
}

      function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    b.x += b.dx;
    b.y += b.dy;


    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    ctx.fill();

    if (
      b.x < player.x + player.w &&
      b.x + b.w > player.x &&
      b.y < player.y + player.h &&
      b.y + b.h > player.y
    ) {
      hp -= 5 + wave * 2;
      enemyBullets.splice(i, 1);
      updateHUD();

if (hp <= 0) {
  pause = true;
  document.getElementById("deathScreen").style.display = "flex";
}

      continue;
    }

    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      enemyBullets.splice(i, 1);
    }
  }
}

      function boomExplosion(x, y) {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x,
      y,
      dx: Math.random() * 8 - 4,
      dy: Math.random() * 8 - 4,
      life: 40,
      color: 'red'
    });
  } 

  enemies.forEach((enemy, i) => {
    const dx = (enemy.x + enemy.w / 2) - x;
    const dy = (enemy.y + enemy.h / 2) - y;
    const dist = Math.hypot(dx, dy);
    if (dist < 100 && enemy.type !== "boomling") {
      enemy.hp -= 5;
    }
  });
}

      
    function updateHUD() {
      document.getElementById('hp').textContent = Math.floor(hp);
      document.getElementById('score').textContent = score;
      document.getElementById('points').textContent = upgradePoints;
      document.getElementById('level').textContent = level;
      document.getElementById('wave').textContent = wave;
    }

    function drawPlayer() {
       ctx.save();
player.dashTrail.forEach(trail => {
  ctx.fillStyle = `rgba(0,255,255,${trail.life / 20})`;
  ctx.beginPath();
  ctx.arc(trail.x + player.w / 2, trail.y + player.h / 2, 20 * (trail.life / 20), 0, Math.PI * 2);
  ctx.fill();
});
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
       ctx.rotate(Math.atan2(mouseY - (player.y + player.h / 2), mouseX - (player.x + player.w / 2)));
       ctx.fillStyle = player.color;
       ctx.beginPath();
       ctx.moveTo(20, 0);
       ctx.lineTo(-20, 15);
       ctx.lineTo(-10, 0);
       ctx.lineTo(-20, -15);
       ctx.closePath();
       ctx.fill();
       ctx.restore();

    }

    function drawEnemy(enemy) {
      ctx.save();
      ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
    ctx.beginPath();
    ctx.fillStyle = enemy.boss ? 'purple' : `hsl(${enemy.hp * 30}, 100%, 50%)`;
      ctx.arc(0, 0, enemy.w / 2 + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = 'black';
      ctx.arc(-5, -5, 3, 0, Math.PI * 2);
      ctx.arc(5, -5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.quadraticCurveTo(0, 10, 5, 5);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

function upgrade(type) {
  if (upgradePoints <= 0) return;
  if (statUpgrades[type] >= UPGRADE_CAP) return;

  if (type === 'speed') player.speed++;
  if (type === 'damage') player.damage++;
  if (type === 'maxHP') { maxHP += 10; hp += 10; }
  if (type === 'reload') fireRateMultiplier = Math.max(0.1, fireRateMultiplier - 0.05);
  if (type === 'luck') luck = Math.max(1.0, luck + 0.05);

  statUpgrades[type]++;
  upgradePoints--;
  updateHUD();
  updateUpgradeButtons();
}

      function updateUpgradeButtons() {
  const menu = document.getElementById("upgradeMenu");
  const types = ['speed', 'damage', 'maxHP', 'reload', 'luck'];
  types.forEach(type => {
    const btn = menu.querySelector(`button[onclick="upgrade('${type}')"]`);
    const count = statUpgrades[type];
    btn.innerText = `${capitalize(type)} (+${type === 'reload' ? '5%' : type === 'maxHP' ? '10' : type === 'luck' ? '5%' : '1'}) [${count}/100]`;
    btn.disabled = (count >= UPGRADE_CAP);
    btn.style.opacity = btn.disabled ? 0.5 : 1;
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



    function drawParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

function updatePlayer() {
    
    if (player.isDashing) {
  player.x += player.dashDir.x * 14;
  player.y += player.dashDir.y * 14;
  player.dashTime--;

  player.dashTrail.push({ x: player.x, y: player.y, life: 20 });

  if (player.dashTime <= 0) {
    player.isDashing = false;
      }    
} else {
  if (keys['w']) player.y -= player.speed;
  if (keys['s']) player.y += player.speed;
  if (keys['a']) player.x -= player.speed;
  if (keys['d']) player.x += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;

  for (let i = droppedItems.length - 1; i >= 0; i--) {
    const item = droppedItems[i];
    if (
      player.x < item.x + item.w &&
      player.x + player.w > item.x &&
      player.y < item.y + item.h &&
      player.y + player.h > item.y
    ) {
if (item.item === 'potion') {
  const healAmount = 50;
  hp = Math.min(maxHP, hp + healAmount);
  createParticle(item.x, item.y, 'green');
    updateHUD();
} else {
  inventory.push(item.item);
  currentWeapon = item.item;
  drawInventory();
}

      droppedItems.splice(i, 1);
    }
  }
    if (player.dashCooldown > 0) player.dashCooldown--;

for (let i = player.dashTrail.length - 1; i >= 0; i--) {
  player.dashTrail[i].life--;
  if (player.dashTrail[i].life <= 0) player.dashTrail.splice(i, 1);
}
    
}
    }

  window.addEventListener('keyup', d => {
    keys[d.key] = false;
      });

    function updateEnemies() {
      enemies.forEach((enemy, index) => {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        if (
             player.x < enemy.x + enemy.w &&
           player.x + player.w > enemy.x &&
             player.y < enemy.y + enemy.h &&
           player.y + player.h > enemy.y
        ) {
          hp -= enemy.boss ? 20 : 0.5;
          updateHUD();
if (hp <= 0) {
  pause = true;
  document.getElementById("deathScreen").style.display = "flex";
          }
        }
      });
    enemies.forEach((enemy, index) => {
  if (['default', 'zoomie', 'tanklet', 'boomling', 'boss'].includes(enemy.type)) {
    let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.dx = Math.cos(angle) * (enemy.speed || 1);
    enemy.dy = Math.sin(angle) * (enemy.speed || 1);
  }

  if (enemy.type === 'spitter') {
    enemy.fireCooldown--;
    if (enemy.fireCooldown <= 0) {
      fireEnemyBullet(enemy.x, enemy.y);
      enemy.fireCooldown = 90;
    }
  }

  enemy.x += enemy.dx;
  enemy.y += enemy.dy;

  if (enemy.x < 0 || enemy.x + enemy.w > canvas.width) enemy.dx *= -1;
  if (enemy.y < 0 || enemy.y + enemy.h > canvas.height) enemy.dy *= -1;


  if (
    player.x < enemy.x + enemy.w &&
    player.x + player.w > enemy.x &&
    player.y < enemy.y + enemy.h &&
    player.y + player.h > enemy.y
  ) {
      if (enemy.type === 'boomling') {
  boomExplosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
  enemies.splice(index, 1);
  return;
}
    hp -= enemy.boss ? 20 : 0.5;
    updateHUD();
if (hp <= 0) {
  pause = true;
  document.getElementById("deathScreen").style.display = "flex";
    }
  }
});

    
    }

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    if (bullet.boomerang) {
      let targetX, targetY;

      if (bullet.state === "out") {
        targetX = bullet.peakX;
        targetY = bullet.peakY;

        const dist = Math.hypot(targetX - bullet.x, targetY - bullet.y);
        if (dist < 10) {
          bullet.state = "return";
        }
      } else if (bullet.state === "return") {
        targetX = player.x + player.w / 2;
        targetY = player.y + player.h / 2;

        const dist = Math.hypot(targetX - bullet.x, targetY - bullet.y);
        if (dist < 20) {
          bullets.splice(i, 1);
          continue;
        }
      }

      const angleToTarget = Math.atan2(targetY - bullet.y, targetX - bullet.x);
      bullet.dx = Math.cos(angleToTarget) * bullet.speed;
      bullet.dy = Math.sin(angleToTarget) * bullet.speed;

      bullet.x += bullet.dx;
      bullet.y += bullet.dy;


      enemies.forEach((enemy, j) => {
        if (
          bullet.x < enemy.x + enemy.w &&
          bullet.x + bullet.w > enemy.x &&
          bullet.y < enemy.y + enemy.h &&
          bullet.y + bullet.h > enemy.y
        ) {
          enemy.hp -= player.damage;
          if (enemy.hp <= 0) {
            createParticle(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.boss ? 'purple' : 'red');
            enemies.splice(j, 1);
            score += enemy.boss ? 100 : 10;
              }
                if (enemy.type === 'boomling') {
    boomExplosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
  }
            if (score % 100 === 0) upgradePoints++;
            itemDrop(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
            updateHUD();
          }
      });


      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(Date.now() / 100);
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, -10);
      ctx.lineTo(0, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (bullet.laser) {
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;

      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bullet.x, bullet.y);
      ctx.lineTo(bullet.x + bullet.dx, bullet.y + bullet.dy);
      ctx.stroke();

        } else if (bullet)
    
        bullet.x += bullet.dx;
    bullet.y += bullet.dy;

ctx.fillStyle = bullet.color || 'yellow';
ctx.beginPath();
ctx.arc(bullet.x, bullet.y, bullet.w / 2, 0, Math.PI * 2);
ctx.fill();
      {

enemies.forEach((enemy, j) => {
  if (
    bullet.x < enemy.x + enemy.w &&
    bullet.x + bullet.w > enemy.x &&
    bullet.y < enemy.y + enemy.h &&
    bullet.y + bullet.h > enemy.y

      )
 {
          if (bullet.explosive) {
      const radius = 200;
      const explosionDamage = player.damage * 3;

      enemies.forEach((e, ej) => {
        const dx = e.x + e.w / 2 - bullet.x;
        const dy = e.y + e.h / 2 - bullet.y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          e.hp -= explosionDamage;
          if (e.hp <= 0) {
            createParticle(e.x + e.w / 2, e.y + e.h / 2, e.boss ? 'purple' : 'red');
            enemies.splice(ej, 1);
            score += e.boss ? 100 : 10;
            if (score % 100 === 0) upgradePoints++;
            itemDrop(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
            updateHUD();
          }
        }
      });

      for (let p = 0; p < 100; p++) {
        particles.push({
          x: bullet.x,
          y: bullet.y,
          dx: Math.random() * 10 - 5,
          dy: Math.random() * 10 - 5,
          life: 50,
          color: 'orange'
        });
      }

      bullets.splice(i, 1);
      return;
    }

      
    const dmg = bullet.laser ? player.damage * 0.1 : player.damage;
    enemy.hp -= dmg;

    if (enemy.hp <= 0) {
      createParticle(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.boss ? 'purple' : 'red');
      enemies.splice(j, 1);
      score += enemy.boss ? 100 : 10;
      if (score % 100 === 0) upgradePoints++;
      itemDrop(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
      updateHUD();
    }

    if (!bullet.laser && !bullet.boomerang) {
      bullets.splice(i, 1);
    }
  }
});
        }
}
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      enemies.forEach(drawEnemy);
      updateBullets();
      updateEnemyBullets();      
      drawParticles();
        
droppedItems.forEach(item => {
  ctx.fillStyle = item.item === 'potion' ? 'lime' : 'white';
  ctx.fillRect(item.x, item.y, item.w, item.h);

  ctx.fillStyle = 'black';
  ctx.font = "12px Verdana";
  ctx.textAlign = "center";
  ctx.fillText(
    item.item === 'potion' ? "Heal +50" : weaponsData[item.item].name,
    item.x + item.w / 2,
    item.y + 20
  );
});


    }

function gameLoop() {
  if (pause) {
    animationFrameId = requestAnimationFrame(gameLoop);
    return;
  }

  if (mouseDown && currentWeapon === 'laser') {
    shootAt(mouseX, mouseY);
  }

  fireCooldown--;
  updatePlayer(); 
  updateEnemies();

  if (enemies.length === 0 && waveTimer <= 0) {
    wave++;
    upgradePoints += 2;
    updateHUD();
    if (score % 500 === 0) level++;
    spawnEnemy();
    waveTimer = 60;
  } else {
    waveTimer--;
  }

  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}


    updateHUD();
    loadGame();
    updateUpgradeButtons();

    document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("closeSkillTree").addEventListener("click", closeSkillTree);
  document.getElementById("startBtn").addEventListener("click", () => {
      pause = false
    document.getElementById("startScreen").style.display = "none";
    gameLoop();
  });

  document.getElementById("howBtn").addEventListener("click", () => {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("howToPlay").style.display = "flex";
  });

  document.getElementById("closeHow").addEventListener("click", () => {
    document.getElementById("howToPlay").style.display = "none";
    document.getElementById("startScreen").style.display = "flex";
  });
});

window.addEventListener('keydown', e => {
  keys[e.key] = true;

  if (e.key === 'u') {
    menuVisible = !menuVisible;
    document.getElementById('upgradeMenu').style.display = menuVisible ? 'block' : 'none';
  }

  if (e.key === 'f') {
    toggleInventory();
              
  }
    if (e.key === ' ') {
  if (!player.isDashing && player.dashCooldown <= 0) {
    let dx = 0, dy = 0;
    if (keys['w']) dy -= 1;
    if (keys['s']) dy += 1;
    if (keys['a']) dx -= 1;
    if (keys['d']) dx += 1;

    const mag = Math.hypot(dx, dy);
    if (mag > 0) {
      player.dashDir.x = dx / mag;
      player.dashDir.y = dy / mag;
    } else {
      const angle = Math.atan2(mouseY - (player.y + player.h / 2), mouseX - (player.x + player.w / 2));
      player.dashDir.x = Math.cos(angle);
      player.dashDir.y = Math.sin(angle);
    }

    player.isDashing = true;
    player.dashTime = 10;
    player.dashCooldown = 60;

    player.dashTrail.push({ x: player.x, y: player.y, life: 20 });
  }
}   
    });
function openSkillTree() {
  pause = true;
  document.getElementById("skillTree").style.display = "flex";
  document.getElementById("skillPointsDisplay").textContent = skillPoints;
}

function closeSkillTree() {
  pause = false;
  document.getElementById("skillTree").style.display = "none";
}

function restartGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  pause = false;
  hp = maxHP = 100;
  level = 1;
  wave = 0;
  score = 0;
  upgradePoints = 0;
  skillPoints = 0;
  fireRateMultiplier = 1.0;

  player = {
    x: 300,
    y: 300,
    w: 40,
    h: 40,
    color: 'cyan',
    speed: 4,
    damage: 1,
    isDashing: false,
    dashCooldown: 0,
    dashTime: 0,
    dashDir: { x: 0, y: 0 },
    dashTrail: []
  };

  inventory = ['pistol'];
  currentWeapon = 'pistol';
  statUpgrades = { speed: 0, damage: 0, maxHP: 0, reload: 0, luck: 0 };

  bullets = [];
  enemyBullets = [];
  enemies = [];
  particles = [];
  droppedItems = [];

  luck = 1.0;
  waveTimer = 60;

  document.getElementById("deathScreen").style.display = "none";
  updateHUD();
  drawInventory();

  gameLoop(); 
    updateUpgradeButtons();
}

