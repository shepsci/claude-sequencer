import { Button } from 'App/shared/Button';
import { usePopupMenu } from './usePopupMenu';
import { Portal } from 'App/shared/Portal';
import { useMemo, ReactNode } from 'react';

interface PopupMenuProps {
  name: string;
  Icon: React.ComponentType;
  disabled?: boolean;
  addBtnClasses?: string;
  keepOpenOnSelect?: boolean;
  active?: boolean;
  activeCB?: () => void;
  children: ReactNode;
}

interface PopupMenuItemsProps {
  renderMenu: boolean;
  menuStyle: React.CSSProperties;
  menuClasses: string;
  children: ReactNode;
}

interface MenuItemProps {
  item: string | number;
  selected: boolean;
  onClick: (item: string | number) => void;
  label?: string;
  disabled?: boolean;
  addClass?: string;
}

interface MenuItemToggleProps {
  item: string | number;
  on: boolean;
  onClick: () => void;
  label?: string;
}

export const PopupMenu: React.FC<PopupMenuProps> = ({
  name,
  Icon,
  disabled = false,
  addBtnClasses = '',
  keepOpenOnSelect,
  active,
  activeCB,
  children,
}) => {
  const popupMenu = usePopupMenu(keepOpenOnSelect, active, activeCB);
  const { btnRef, btnClasses, onClick, renderMenu, menuStyle, menuClasses } = popupMenu;

  const memo = useMemo(() => {
    const btnId = `${name}Btn`;
    return (
      <div ref={btnRef} className="menuBtnWrapper ">
        <Button
          id={btnId}
          classes={btnClasses + ' ' + addBtnClasses}
          disabled={disabled}
          onClick={onClick}
        >
          <Icon />
          <label htmlFor={btnId}>{name}</label>
        </Button>
        <PopupMenuItems renderMenu={renderMenu} menuStyle={menuStyle} menuClasses={menuClasses}>
          {children}
        </PopupMenuItems>
      </div>
    );
  }, [
    addBtnClasses,
    btnClasses,
    btnRef,
    children,
    disabled,
    Icon,
    menuClasses,
    menuStyle,
    name,
    onClick,
    renderMenu,
  ]);
  return memo;
};

const PopupMenuItems: React.FC<PopupMenuItemsProps> = ({
  renderMenu,
  menuStyle,
  menuClasses,
  children,
}) => {
  const memo = useMemo(() => {
    return (
      <Portal targetId="popupMenuPortal">
        <div style={menuStyle} className={menuClasses}>
          {children}
        </div>
      </Portal>
    );
  }, [children, menuClasses, menuStyle]);
  return !renderMenu ? null : memo;
};

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  selected,
  onClick,
  label,
  disabled,
  addClass = '',
}) => {
  const btnId = `item${item}`;
  let classes = addClass + ' popupMenuBtn';
  if (selected) classes += ' active';
  const memo = useMemo(() => {
    return (
      <Button
        id={btnId}
        classes={classes}
        disabled={selected || disabled}
        onClick={() => onClick(item)}
      >
        <label htmlFor={btnId}>{label ? label : item}</label>
      </Button>
    );
  }, [btnId, classes, disabled, item, label, onClick, selected]);
  return memo;
};

export const MenuItemToggle: React.FC<MenuItemToggleProps> = ({ item, on, onClick, label }) => {
  const btnId = `itemToggle${item}`;
  const memo = useMemo(() => {
    return (
      <Button id={btnId} classes={on ? 'popupMenuBtn active' : 'popupMenuBtn'} onClick={onClick}>
        <label htmlFor={btnId}>{label ? label : item}</label>
      </Button>
    );
  }, [btnId, item, label, on, onClick]);
  return memo;
};
