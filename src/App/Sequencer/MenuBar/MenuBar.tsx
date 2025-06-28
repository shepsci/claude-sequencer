import React, { useMemo } from 'react';
import { TransportPanel } from './MenuItems/Transport/TransportPanel';
import { EraseBtn } from './MenuItems/EraseBtn';
import { FileMenu } from './MenuItems/FileMenu';
import { InfoBtn, KitBtn } from './MenuItems/OpenPathBtn';
import { MixerMenu } from './MenuItems/MixerMenu';
import { TapMenu } from './MenuItems/TapMenu';
import { DisplayMenu } from './MenuItems/DisplayMenu/DisplayMenu';
import { useAppSelector } from 'App/hooks/redux';
import { Scrollable } from 'App/shared/Scrollable/Scrollable';

// Import UndoRedoMenu as JS component since it uses connect()
const UndoRedoMenu = require('./MenuItems/UndoRedoMenu').UndoRedoMenu;

export const MenuBar: React.FC = () => {
  const vh = useAppSelector(state => state.screen.dimensions.vh);
  const landscape = useAppSelector(state => state.screen.dimensions.landscape);

  const memo = useMemo(() => {
    let height = landscape ? vh * 0.15 : vh * 0.1;
    if (height > 100) height = 100;
    return (
      <Scrollable id="menuBar" style={{ height }}>
        <div className="menuItems">
          <InfoBtn />
          <DisplayMenu />
          <FileMenu />
          <KitBtn />
        </div>
        <TransportPanel />
        <div className="menuItems">
          <MixerMenu />
          <TapMenu />
          <UndoRedoMenu />
          <EraseBtn />
        </div>
      </Scrollable>
    );
  }, [landscape, vh]);
  return memo;
};
