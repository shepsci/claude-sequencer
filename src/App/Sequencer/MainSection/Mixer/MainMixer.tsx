import { Portal } from 'App/shared/Portal';
import { useTouchAndMouse } from 'hooks/useTouchAndMouse';
import { Knob } from './Knob';
import { useCallback, useRef, useState } from 'react';
import { Button } from 'App/shared/Button';
import { useAppDispatch, useAppSelector } from 'App/hooks/redux';
import {
  MAIN_MIXER_PROPERTIES,
  adjustMainMixer,
  adjustMainMixerWarp,
  resetMainMixerProperty,
  resetMainMixerWarp,
  type MainMixer as MainMixerType,
  type MixerProperty,
} from 'App/reducers/sequenceSlice';
import { getY } from 'utils/getY';

interface RotaryKnobProps {
  property: keyof MainMixerType;
  value: number;
  properties: MixerProperty;
}

export const MainMixer: React.FC = () => {
  const mainMixer = useAppSelector(state => state.sequence.present.mainMixer);
  return (
    <Portal targetId="overGridPortal">
      <div id="mixer" className="mixer">
        <div className="mixItemWrapper main">
          {Object.entries(mainMixer).map(([property, value]) => {
            const properties = MAIN_MIXER_PROPERTIES[property as keyof MainMixerType];
            return (
              <RotaryKnob
                key={`${property}mainMixer`}
                property={property as keyof MainMixerType}
                value={value}
                properties={properties}
              />
            );
          })}
        </div>
      </div>
    </Portal>
  );
};

const RotaryKnob: React.FC<RotaryKnobProps> = ({ property, value, properties }) => {
  const dispatch = useAppDispatch();

  const adjustMixer = useCallback(
    (amount: number) => {
      if (property === 'warp') dispatch(adjustMainMixerWarp(amount));
      else dispatch(adjustMainMixer({ property, amount }));
    },
    [dispatch, property]
  );

  const [editing, setEditing] = useState(false);

  const prevYRef = useRef<number | null>(null);

  const startFunc = useCallback((e: React.TouchEvent<Element> | React.MouseEvent<Element>) => {
    setEditing(true);
    prevYRef.current = getY(e);
  }, []);

  const moveFunc = (e: React.TouchEvent<Element> | React.MouseEvent<Element>) => {
    const newY = getY(e);
    if (prevYRef.current !== null) {
      const amount = prevYRef.current - newY;
      adjustMixer(amount);
      prevYRef.current = newY;
    }
  };

  const reset = useCallback(() => {
    if (property === 'warp') dispatch(resetMainMixerWarp());
    else dispatch(resetMainMixerProperty(property));
  }, [dispatch, property]);

  const endFunc = useCallback(() => {
    setEditing(false);
    if (properties.snapback) setTimeout(reset, 0);
    prevYRef.current = null;
  }, [properties.snapback, reset]);

  const touchAndMouse = useTouchAndMouse(startFunc, moveFunc, endFunc);

  const id = `mainMixItem${property}`;
  const knobId = `${id}Knob`;
  let containerClass = 'mixItem';
  if (editing) containerClass += ' editing';
  return (
    <div id={id} className={containerClass}>
      <p className="mixItemName">{property}</p>
      <div className="mixProperties main">
        <Knob value={value} id={knobId} {...touchAndMouse} onDoubleClick={reset} />
        <Button
          disabled={properties.snapback || value === properties.initialValue}
          classes="reset"
          onClick={reset}
        >
          reset
        </Button>
      </div>
    </div>
  );
};
