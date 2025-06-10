import React, { useEffect, useRef, useState } from 'react';
import { Game, Types } from 'phaser';
import { DungeonScene } from './scenes/DungeonScene';
import { calculateMinInitialHealth, EXAMPLE_DUNGEONS } from './utils/dungeonLogic';

function App() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Game | null>(null);
  const [currentDungeon, setCurrentDungeon] = useState(0);
  const [gameStats, setGameStats] = useState({
    knightHealth: 0,
    knightX: 0,
    knightY: 0,
    gameOver: false,
    victory: false,
    pathTaken: [] as Array<{x: number, y: number}>
  });

  const dungeon = EXAMPLE_DUNGEONS[currentDungeon];
  const minHealth = calculateMinInitialHealth(dungeon.grid);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#2c3e50',
      scene: DungeonScene,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      }
    };

    phaserGameRef.current = new Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!phaserGameRef.current) return;

    const scene = phaserGameRef.current.scene.getScene('DungeonScene') as DungeonScene | undefined;
    if (!scene) return;

    const load = () => scene.loadDungeon(dungeon.grid, setGameStats);

    if (scene.scene.isActive()) {
      load();
    } else {
      scene.events.once('create', load);
    }
  }, [currentDungeon, dungeon.grid]);

  const resetGame = () => {
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('DungeonScene') as DungeonScene;
      if (scene) {
        scene.resetGame();
      }
    }
  };

  const nextDungeon = () => {
    setCurrentDungeon((prev) => (prev + 1) % EXAMPLE_DUNGEONS.length);
  };

  const prevDungeon = () => {
    setCurrentDungeon((prev) => (prev - 1 + EXAMPLE_DUNGEONS.length) % EXAMPLE_DUNGEONS.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🏰 Dungeon Game</h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Ajude o cavaleiro a resgatar a princesa! Use as setas ➡️ e ⬇️ para mover-se pelo dungeon.
            Evite que sua vida chegue a zero e encontre o caminho ótimo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
              <div ref={gameRef} className="w-full" />
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            {/* Current Stats */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">📊 Status Atual</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>❤️ Vida:</span>
                  <span className={`font-bold ${gameStats.knightHealth <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {gameStats.knightHealth}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>📍 Posição:</span>
                  <span className="font-mono">({gameStats.knightX}, {gameStats.knightY})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🗡️ Status:</span>
                  <span className={`font-bold ${
                    gameStats.victory ? 'text-green-400' : 
                    gameStats.gameOver ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {gameStats.victory ? '👑 Vitória!' : 
                     gameStats.gameOver ? '💀 Morreu' : '⚔️ Lutando'}
                  </span>
                </div>
              </div>
              
              {(gameStats.gameOver || gameStats.victory) && (
                <button
                  onClick={resetGame}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🔄 Jogar Novamente
                </button>
              )}
            </div>

            {/* Dungeon Info */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">🗺️ Dungeon {currentDungeon + 1}</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>📏 Tamanho:</span>
                  <span className="font-mono">{dungeon.grid.length}x{dungeon.grid[0].length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>💪 Vida Mínima:</span>
                  <span className="font-bold text-blue-400">{minHealth}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={prevDungeon}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  ⬅️ Anterior
                </button>
                <button
                  onClick={nextDungeon}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Próximo ➡️
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">🎮 Legenda</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <span>🛡️ Cavaleiro</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-pink-500 rounded"></div>
                  <span>👸 Princesa</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded"></div>
                  <span>👹 Demônio (dano)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span>✨ Orbe mágico (cura)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-500 rounded"></div>
                  <span>⬜ Sala vazia</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-600 text-sm text-gray-300">
                <p><strong>Controles:</strong></p>
                <p>➡️ Seta direita: mover para direita</p>
                <p>⬇️ Seta baixo: mover para baixo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Explanation */}
        <div className="mt-12 bg-gray-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-6">🧠 Como Resolver o Problema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Estratégia</h3>
              <p className="text-gray-300 mb-4">
                Este é um problema de programação dinâmica que deve ser resolvido de trás para frente, 
                começando da princesa e calculando a vida mínima necessária para cada posição.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Comece da posição da princesa (canto inferior direito)</li>
                <li>Para cada célula, calcule a vida mínima necessária</li>
                <li>A vida nunca pode ser menor que 1</li>
                <li>Trabalhe de trás para frente até chegar ao início</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-400">Fórmula</h3>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <p className="text-yellow-300">// Para cada célula (i,j):</p>
                <p className="text-white">min_health[i][j] = max(1,</p>
                <p className="text-white ml-4">min(min_health[i+1][j],</p>
                <p className="text-white ml-8">min_health[i][j+1])</p>
                <p className="text-white ml-4">- dungeon[i][j])</p>
              </div>
              <p className="text-gray-300 mt-4">
                O cavaleiro precisa ter vida suficiente para sobreviver à sala atual 
                e ter pelo menos 1 de vida após entrar na próxima sala.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;