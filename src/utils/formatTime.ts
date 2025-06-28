export const formatTime = (time: number): string => {
  const timeInSecs = time / 1000;
  const minutes = parseInt((timeInSecs / 60).toString()).toString();
  const seconds = parseInt((timeInSecs % 60).toString()).toString();
  const formattedTime = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  return formattedTime;
};
