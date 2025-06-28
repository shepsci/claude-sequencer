export const getY = (e: React.TouchEvent<Element> | React.MouseEvent<Element>): number => {
  let y: number;
  if ('touches' in e && e.touches) {
    y = e.touches[0].clientY;
  } else {
    y = (e as React.MouseEvent<Element>).clientY;
  }
  return y;
};
