const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// ===== GLOBALS =====
let player, chest, cursors;
let bubbleText, bubbleBg;
let move = { left: false, right: false };
let chestActive = true;

// Responsive speed
const SPEED = Math.max(250, window.innerWidth * 0.2);

// ===== PRELOAD =====
function preload() {
  this.load.image("bg", "assets/background.png");
  this.load.image("player", "assets/player.png");
  this.load.image("chest", "assets/object.png");
}

// ===== CREATE =====
function create() {
  // Background
  this.add.image(
    this.scale.width / 2,
    this.scale.height / 2,
    "bg"
  )
    .setDisplaySize(this.scale.width, this.scale.height)
    .setTint(0x8899cc); // 🌙 calm night tone

  // Player
  player = this.physics.add.sprite(
    80,
    this.scale.height / 2,
    "player"
  )
    .setScale(0.5)
    .setCollideWorldBounds(true);

  // Chest (interactive object)
  chest = this.physics.add.sprite(
    this.scale.width - 100,
    this.scale.height / 2,
    "chest"
  )
    .setScale(0.4);

  cursors = this.input.keyboard.createCursorKeys();

  // Speech bubble
  bubbleBg = this.add.graphics().setVisible(false);
  bubbleText = this.add.text(0, 0, "", {
    fontSize: "14px",
    color: "#000",
    align: "center",
    wordWrap: { width: 220 }
  })
    .setOrigin(0.5)
    .setVisible(false);

  // Chest interaction (fires ONCE per touch)
  this.physics.add.overlap(player, chest, () => {
    if (!chestActive) return;

    chestActive = false;

    showMessage(this, "You're doing amazing 💙");
    heartPop(this);

    this.time.delayedCall(600, () => {
      moveChest();
      chestActive = true;
    });
  });

  setupMobileControls();
}

// ===== UPDATE =====
function update() {
  if (!player) return;

  player.setVelocityX(0);

  if (cursors.left.isDown || move.left) {
    player.setVelocityX(-SPEED);
  }

  if (cursors.right.isDown || move.right) {
    player.setVelocityX(SPEED);
  }

  updateBubble();
}

// ===== UI FUNCTIONS =====
function showMessage(scene, text) {
  bubbleText.setText(text).setVisible(true);
  bubbleBg.setVisible(true);

  speak(text);

  scene.time.delayedCall(2500, () => {
    bubbleText.setVisible(false);
    bubbleBg.setVisible(false);
  });
}

function updateBubble() {
  if (!bubbleText.visible) return;

  const x = player.x;
  const y = player.y - 70;

  bubbleText.setPosition(x, y);

  bubbleBg.clear();
  bubbleBg.fillStyle(0xffffff, 0.95);
  bubbleBg.fillRoundedRect(
    x - bubbleText.width / 2 - 10,
    y - bubbleText.height / 2 - 8,
    bubbleText.width + 20,
    bubbleText.height + 16,
    12
  );
}

// ❤️ Heart animation (no image assets)
function heartPop(scene) {
  const heart = scene.add.text(
    player.x,
    player.y - 20,
    "❤️",
    { fontSize: "20px" }
  ).setOrigin(0.5);

  scene.tweens.add({
    targets: heart,
    y: heart.y - 40,
    alpha: 0,
    duration: 800,
    ease: "Sine.easeOut",
    onComplete: () => heart.destroy()
  });
}

// Move chest ONLY after interaction
function moveChest() {
  chest.setPosition(
    Phaser.Math.Between(80, game.scale.width - 80),
    game.scale.height / 2
  );
}

// 🎤 Speech (emoji-safe)
function speak(text) {
  if (!window.speechSynthesis) return;

  const cleanText = text.replace(
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
    ""
  );

  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(cleanText.trim());
  msg.rate = 0.95;
  msg.pitch = 1.05;
  speechSynthesis.speak(msg);
}

// 📱 Mobile controls (LEFT / RIGHT only)
function setupMobileControls() {
  ["left", "right"].forEach(dir => {
    const btn = document.getElementById(dir);
    if (!btn) return;

    btn.addEventListener("touchstart", () => move[dir] = true);
    btn.addEventListener("touchend", () => move[dir] = false);
  });
}
