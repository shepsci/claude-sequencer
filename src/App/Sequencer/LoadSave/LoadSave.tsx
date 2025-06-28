import React, { useMemo } from 'react';
import { Load } from 'App/Sequencer/LoadSave/Load/Load';
import { Save } from 'App/Sequencer/LoadSave/Save/Save';
import { Button } from 'App/shared/Button';
import { LoginSection } from './LoginSection';
import { useGoTo } from 'hooks/useGoTo';
import { Portal } from 'App/shared/Portal';

interface LoadSaveProps {
  tab: 'load' | 'save';
}

interface TabsProps {
  tab: 'load' | 'save';
}

export const LoadSave: React.FC<LoadSaveProps> = ({ tab }) => {
  const goTo = useGoTo();

  const memo = useMemo(() => {
    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).id && (e.target as HTMLElement).id === 'loadSave') {
        goTo.base();
      }
    };

    return (
      <Portal targetId="fullScreenPortal">
        <>
          <div id="loadSave" className="loadSave" onClick={onClick}>
            <div className="top">
              <Tabs tab={tab} />
              <LoginSection />
            </div>
            {tab === 'save' && <Save />}
            {tab === 'load' && <Load />}
          </div>
          <div className={'bottomBtn'}>
            <Button onClick={() => goTo.base()}>Close</Button>
          </div>
        </>
      </Portal>
    );
  }, [goTo, tab]);
  return memo;
};

const Tabs: React.FC<TabsProps> = ({ tab }) => {
  const goTo = useGoTo();
  const changeTab = (e: React.MouseEvent<HTMLInputElement>) => {
    const buttonValue = (e.target as HTMLInputElement).value;
    if (buttonValue === 'load') goTo.load();
    if (buttonValue === 'save') goTo.save();
  };
  let loadClasses = 'tab';
  let saveClasses = loadClasses;
  if (tab === 'load') loadClasses += ' selected';
  if (tab === 'save') saveClasses += ' selected';
  return (
    <div className="tabs">
      <input
        type="button"
        id="load-tab"
        className={loadClasses}
        value="load"
        aria-label="load"
        onClick={changeTab}
      />
      <input
        type="button"
        id="save-tab"
        className={saveClasses}
        value="save"
        aria-label="save"
        onClick={changeTab}
      />
    </div>
  );
};
