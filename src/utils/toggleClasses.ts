export const hideEditable = (): void => {
  const cells = document.querySelectorAll('.on');
  cells.forEach(cell => cell.classList.remove('flashing'));
};

export const showEditable = (): void => {
  const cells = document.querySelectorAll('.on');
  cells.forEach(cell => cell.classList.add('flashing'));
};
