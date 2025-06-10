import { Scene } from 'phaser';

export interface GameStats {
  knightHealth: number;
  knightX: number;
  knightY: number;
  gameOver: boolean;
  victory: boolean;
  pathTaken: Array<{x: number, y: number}>;
}

export class DungeonScene extends Scene {
  private dungeon: number[][] = [];
  private knight!: Phaser.GameObjects.Rectangle;
  private princess!: Phaser.GameObjects.Rectangle;
  private cells: Phaser.GameObjects.Rectangle[][] = [];
  private cellTexts: Phaser.GameObjects.Text[][] = [];
  private knightHealth = 7;
  private knightX = 0;
  private knightY = 0;
  private cellSize = 80;
  private gameOver = false;
  private victory = false;
  private pathTaken: Array<{x: number, y: number}> = [];
  private updateStats?: (stats: GameStats) => void;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Add title
    this.add.text(400, 30, '🏰 Dungeon Game - LeetCode', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add instructions
    this.add.text(400, 60, 'Use ➡️ e ⬇️ para mover o cavaleiro', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  loadDungeon(dungeonGrid: number[][], statsCallback: (stats: GameStats) => void) {
    this.dungeon = dungeonGrid;
    this.updateStats = statsCallback;
    this.resetGame();
    this.createDungeonVisual();
  }

  resetGame() {
    this.knightHealth = 7; // Default starting health, will be adjusted
    this.knightX = 0;
    this.knightY = 0;
    this.gameOver = false;
    this.victory = false;
    this.pathTaken = [{x: 0, y: 0}];
    this.updateGameStats();
  }

  createDungeonVisual() {
    // Clear existing visuals
    this.cells.forEach(row => row.forEach(cell => cell.destroy()));
    this.cellTexts.forEach(row => row.forEach(text => text.destroy()));
    if (this.knight) this.knight.destroy();
    if (this.princess) this.princess.destroy();

    this.cells = [];
    this.cellTexts = [];

    const rows = this.dungeon.length;
    const cols = this.dungeon[0].length;
    const startX = 400 - (cols * this.cellSize) / 2;
    const startY = 120;

    // Create dungeon grid
    for (let i = 0; i < rows; i++) {
      this.cells[i] = [];
      this.cellTexts[i] = [];
      
      for (let j = 0; j < cols; j++) {
        const x = startX + j * this.cellSize;
        const y = startY + i * this.cellSize;
        const value = this.dungeon[i][j];

        // Create cell background
        let color = 0x2c3e50; // Default gray
        if (value > 0) color = 0x27ae60; // Green for healing
        else if (value < 0) color = 0xe74c3c; // Red for damage

        const cell = this.add.rectangle(x, y, this.cellSize - 2, this.cellSize - 2, color)
          .setStrokeStyle(2, 0xffffff);
        
        this.cells[i][j] = cell;

        // Add cell value text
        const text = this.add.text(x, y + 20, value.toString(), {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.cellTexts[i][j] = text;

        // Add emoji indicators
        let emoji = '';
        if (value > 0) emoji = '✨';
        else if (value < 0) emoji = '👹';
        else emoji = '⬜';

        this.add.text(x, y - 15, emoji, {
          fontSize: '20px'
        }).setOrigin(0.5);
      }
    }

    // Create knight
    const knightX = startX + this.knightX * this.cellSize;
    const knightY = startY + this.knightY * this.cellSize;
    this.knight = this.add.rectangle(knightX, knightY, 30, 30, 0x3498db)
      .setStrokeStyle(3, 0xffffff);
    
    this.add.text(knightX, knightY, '🛡️', {
      fontSize: '24px'
    }).setOrigin(0.5);

    // Create princess
    const princessX = startX + (cols - 1) * this.cellSize;
    const princessY = startY + (rows - 1) * this.cellSize;
    this.princess = this.add.rectangle(princessX, princessY, 30, 30, 0xe91e63)
      .setStrokeStyle(3, 0xffffff);
    
    this.add.text(princessX, princessY, '👸', {
      fontSize: '24px'
    }).setOrigin(0.5);

    // Apply initial room effect
    this.applyRoomEffect();
  }

  update() {
    if (this.gameOver || this.victory) return;

    // Handle input
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
      this.moveKnight(0, 1); // Move right
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.moveKnight(1, 0); // Move down
    }
  }

  moveKnight(deltaY: number, deltaX: number) {
    const newX = this.knightX + deltaX;
    const newY = this.knightY + deltaY;

    // Check bounds
    if (newX < 0 || newX >= this.dungeon[0].length || 
        newY < 0 || newY >= this.dungeon.length) {
      return;
    }

    // Update position
    this.knightX = newX;
    this.knightY = newY;
    this.pathTaken.push({x: newX, y: newY});

    // Update visual position
    const startX = 400 - (this.dungeon[0].length * this.cellSize) / 2;
    const startY = 120;
    const knightX = startX + this.knightX * this.cellSize;
    const knightY = startY + this.knightY * this.cellSize;
    
    this.knight.setPosition(knightX, knightY);

    // Apply room effect
    this.applyRoomEffect();

    // Check win condition
    if (this.knightX === this.dungeon[0].length - 1 && 
        this.knightY === this.dungeon.length - 1) {
      this.victory = true;
      this.showVictoryMessage();
    }

    this.updateGameStats();
  }

  applyRoomEffect() {
    const roomValue = this.dungeon[this.knightY][this.knightX];
    this.knightHealth += roomValue;

    if (this.knightHealth <= 0) {
      this.gameOver = true;
      this.showGameOverMessage();
    }
  }

  showGameOverMessage() {
    this.add.text(400, 500, '💀 GAME OVER! 💀', {
      fontSize: '32px',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 540, 'Pressione R para reiniciar ou mude de dungeon', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  showVictoryMessage() {
    this.add.text(400, 500, '👑 VITÓRIA! 👑', {
      fontSize: '32px',
      color: '#27ae60',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 540, `Princesa resgatada! Vida final: ${this.knightHealth}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  updateGameStats() {
    if (this.updateStats) {
      this.updateStats({
        knightHealth: this.knightHealth,
        knightX: this.knightX,
        knightY: this.knightY,
        gameOver: this.gameOver,
        victory: this.victory,
        pathTaken: [...this.pathTaken]
      });
    }
  }
}