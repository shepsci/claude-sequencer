import { useCallback, useEffect, useState } from 'react';

export const useShowAndHideClass = (
  baseClasses = '',
  timeout = 0,
  trigger1?: boolean,
  trigger2?: boolean
): string => {
  const [classes, setClasses] = useState<string>(baseClasses);

  const showAndHide = useCallback(
    (trigger?: boolean) => {
      if (!trigger) return;
      setClasses(baseClasses + ' show');
      try {
        setTimeout(() => setClasses(baseClasses), timeout);
      } catch (e) {
        // component unmounted
      }
    },
    [baseClasses, timeout]
  );

  useEffect(() => showAndHide(trigger1), [baseClasses, showAndHide, timeout, trigger1]);
  useEffect(() => showAndHide(trigger2), [baseClasses, showAndHide, timeout, trigger2]);

  return classes;
};

export const vanillaShowAndHideClass = (id: string, classToAdd: string, timeout: number): void => {
  const element = document.getElementById(id);
  if (element) element.classList.add(classToAdd);
  setTimeout(() => {
    if (element) element.classList.remove(classToAdd);
  }, timeout);
};

export const useAddAndRemoveClass = (
  baseClasses = '',
  addClasses = '',
  timeout = 0
): [string, () => void] => {
  const [classes, setClasses] = useState<string>(baseClasses);
  const [trigger, setTrigger] = useState<boolean>(false);
  useEffect(() => {
    if (!trigger) return;
    setClasses(baseClasses + ' ' + addClasses);
    setTrigger(false);
    try {
      setTimeout(() => setClasses(baseClasses), timeout);
    } catch (e) {
      // component unmounted
    }
  }, [addClasses, baseClasses, timeout, trigger]);
  return [classes, () => setTrigger(true)];
};

export const useShowAndHideText = (
  baseText = ''
): [string, (newText: string, timeout: number) => void] => {
  const [text, setText] = useState<string>(baseText);
  const showAndHideText = (newText: string, timeout: number): void => {
    setText(newText);
    try {
      setTimeout(() => setText(''), timeout);
    } catch (e) {
      // component unmounted
    }
  };
  return [text, showAndHideText];
};
