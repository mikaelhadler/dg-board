export interface DungeonExample {
  name: string;
  grid: number[][];
  description: string;
}

export const EXAMPLE_DUNGEONS: DungeonExample[] = [
  {
    name: "Exemplo Clássico",
    grid: [
      [-2, -3, 3],
      [-5, -10, 1],
      [10, 30, -5]
    ],
    description: "O exemplo clássico do LeetCode. Vida mínima necessária: 7"
  },
  {
    name: "Dungeon Simples",
    grid: [[0]],
    description: "Dungeon de uma sala. Vida mínima necessária: 1"
  },
  {
    name: "Só Demônios",
    grid: [
      [-3, -5],
      [-1, -4]
    ],
    description: "Dungeon cheio de demônios. Cuidado!"
  },
  {
    name: "Só Cura",
    grid: [
      [1, 2, 3],
      [4, 5, 6]
    ],
    description: "Dungeon com apenas orbes de cura. Vida mínima: 1"
  },
  {
    name: "Desafio Extremo",
    grid: [
      [-20, 2, -5, 10],
      [1, -10, -2, 3],
      [-5, 5, -3, -8],
      [8, -15, 1, -4]
    ],
    description: "Dungeon grande e desafiador. Encontre o melhor caminho!"
  }
];

/**
 * Calcula a vida inicial mínima necessária para completar o dungeon
 * usando programação dinâmica (bottom-up approach)
 */
export function calculateMinInitialHealth(dungeon: number[][]): number {
  const m = dungeon.length;
  const n = dungeon[0].length;
  
  // Tabela DP para armazenar a vida mínima necessária em cada posição
  const dp: number[][] = Array(m).fill(null).map(() => Array(n).fill(0));
  
  // Começamos da princesa (canto inferior direito)
  // A vida mínima após entrar na última sala deve ser pelo menos 1
  dp[m - 1][n - 1] = Math.max(1, 1 - dungeon[m - 1][n - 1]);
  
  // Preenche a última linha (só pode vir da direita)
  for (let j = n - 2; j >= 0; j--) {
    dp[m - 1][j] = Math.max(1, dp[m - 1][j + 1] - dungeon[m - 1][j]);
  }
  
  // Preenche a última coluna (só pode vir de baixo)
  for (let i = m - 2; i >= 0; i--) {
    dp[i][n - 1] = Math.max(1, dp[i + 1][n - 1] - dungeon[i][n - 1]);
  }
  
  // Preenche o resto da tabela
  for (let i = m - 2; i >= 0; i--) {
    for (let j = n - 2; j >= 0; j--) {
      // Escolhe o caminho que requer menos vida inicial
      const minHealthNeeded = Math.min(dp[i + 1][j], dp[i][j + 1]);
      dp[i][j] = Math.max(1, minHealthNeeded - dungeon[i][j]);
    }
  }
  
  return dp[0][0];
}

/**
 * Encontra o caminho ótimo que requer a vida inicial mínima
 */
export function findOptimalPath(dungeon: number[][]): Array<{x: number, y: number}> {
  const m = dungeon.length;
  const n = dungeon[0].length;
  const path: Array<{x: number, y: number}> = [];
  
  // Recalcula a tabela DP para saber as vidas mínimas
  const dp: number[][] = Array(m).fill(null).map(() => Array(n).fill(0));
  
  dp[m - 1][n - 1] = Math.max(1, 1 - dungeon[m - 1][n - 1]);
  
  for (let j = n - 2; j >= 0; j--) {
    dp[m - 1][j] = Math.max(1, dp[m - 1][j + 1] - dungeon[m - 1][j]);
  }
  
  for (let i = m - 2; i >= 0; i--) {
    dp[i][n - 1] = Math.max(1, dp[i + 1][n - 1] - dungeon[i][n - 1]);
  }
  
  for (let i = m - 2; i >= 0; i--) {
    for (let j = n - 2; j >= 0; j--) {
      const minHealthNeeded = Math.min(dp[i + 1][j], dp[i][j + 1]);
      dp[i][j] = Math.max(1, minHealthNeeded - dungeon[i][j]);
    }
  }
  
  // Reconstrói o caminho ótimo
  let i = 0, j = 0;
  path.push({x: j, y: i});
  
  while (i < m - 1 || j < n - 1) {
    if (i === m - 1) {
      // Só pode ir para a direita
      j++;
    } else if (j === n - 1) {
      // Só pode ir para baixo
      i++;
    } else {
      // Escolhe o caminho com menor vida necessária
      if (dp[i][j + 1] <= dp[i + 1][j]) {
        j++; // Direita
      } else {
        i++; // Baixo
      }
    }
    path.push({x: j, y: i});
  }
  
  return path;
}