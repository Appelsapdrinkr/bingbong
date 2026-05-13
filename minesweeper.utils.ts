import { Cell } from "./minesweeper.types";

export const DEFAULT_ROWS = 8;
export const DEFAULT_COLS = 8;
export const DEFAULT_MINES = 10;

export const createEmptyBoard = (
  rows = DEFAULT_ROWS,
  cols = DEFAULT_COLS,
): Cell[][] => {
  const board: Cell[][] = [];

  for (let row = 0; row < rows; row += 1) {
    const line: Cell[] = [];
    for (let col = 0; col < cols; col += 1) {
      line.push({
        row,
        col,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }
    board.push(line);
  }

  return board;
};

const countNeighborMines = (board: Cell[][], row: number, col: number) => {
  let count = 0;
  const rows = board.length;
  const cols = board[0]?.length || 0;

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;

      const newRow = row + rowOffset;
      const newCol = col + colOffset;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        board[newRow][newCol].isMine
      ) {
        count += 1;
      }
    }
  }

  return count;
};

const cloneBoard = (board: Cell[][]) =>
  board.map((row) => row.map((cell) => ({ ...cell })));

export const generateBoard = (
  rows = DEFAULT_ROWS,
  cols = DEFAULT_COLS,
  mineCount = DEFAULT_MINES,
): Cell[][] => {
  const board = createEmptyBoard(rows, cols);
  const totalCells = rows * cols;
  const actualMineCount = Math.min(mineCount, totalCells - 1); // Ensure at least one safe cell

  const allIndexes = Array.from({ length: totalCells }, (_, index) => index);
  const shuffled = allIndexes.sort(() => Math.random() - 0.5);
  const minePositions = shuffled.slice(0, actualMineCount);

  minePositions.forEach((position) => {
    const row = Math.floor(position / cols);
    const col = position % cols;
    board[row][col].isMine = true;
  });

  return updateNeighborCounts(board);
};

export const createBoardFromDesign = (board: Cell[][]) =>
  updateNeighborCounts(cloneBoard(board));

export const updateNeighborCounts = (board: Cell[][]): Cell[][] => {
  const nextBoard = cloneBoard(board);
  const rows = board.length;
  const cols = board[0]?.length || 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      nextBoard[row][col].neighborMines = countNeighborMines(
        nextBoard,
        row,
        col,
      );
    }
  }

  return nextBoard;
};

export const revealCells = (
  board: Cell[][],
  row: number,
  col: number,
): Cell[][] => {
  const nextBoard = cloneBoard(board);
  const rows = board.length;
  const cols = board[0]?.length || 0;
  const cell = nextBoard[row][col];

  if (cell.isRevealed || cell.isFlagged) {
    return nextBoard;
  }

  cell.isRevealed = true;

  if (cell.neighborMines === 0 && !cell.isMine) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;

        if (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          !(rowOffset === 0 && colOffset === 0)
        ) {
          const neighbor = nextBoard[newRow][newCol];
          if (!neighbor.isRevealed && !neighbor.isMine && !neighbor.isFlagged) {
            const revealedBoard = revealCells(nextBoard, newRow, newCol);
            for (let r = 0; r < rows; r += 1) {
              for (let c = 0; c < cols; c += 1) {
                nextBoard[r][c] = revealedBoard[r][c];
              }
            }
          }
        }
      }
    }
  }

  return nextBoard;
};

export const checkWin = (board: Cell[][]) =>
  board
    .flat()
    .every((cell) => (cell.isMine ? !cell.isRevealed : cell.isRevealed));

export const resetBoardState = (board: Cell[][]) =>
  board.map((rowCells) =>
    rowCells.map((cell) => ({
      ...cell,
      isRevealed: false,
      isFlagged: false,
    })),
  );
