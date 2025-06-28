export const getGrid = (length: number): number[] => {
  const grid: number[] = [];
  for (let i = 0; i < length; i++) {
    grid.push(i);
  }
  return grid;
};
