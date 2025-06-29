import { useMemo } from 'react';
import { useTouchAndMouse } from 'hooks/useTouchAndMouse';
import * as icons from 'assets/icons/kit';
import { useSampleBtn, useSampleBtnContainer } from './useSampleBtns';

interface Sample {
  name: string;
  icon: string;
  color: string;
}

interface SampleBtnProps {
  i: number;
  sample: Sample;
  selectSample: (index: number) => void;
  selected: boolean;
}

const SampleBtnContainer: React.FC = () => {
  const { kit, selectSample, selectedSample } = useSampleBtnContainer();
  const sampleBtnsMemo = useMemo(() => {
    return !kit ? null : (
      <div className="sampleBtns">
        {kit.samples.map((sample: Sample, i: number) => (
          <SampleBtn
            key={`sample-menu-${sample.name}`}
            i={i}
            sample={sample}
            selectSample={selectSample}
            selected={selectedSample === i}
          />
        ))}
        <div id="sampleBtnsBorder" />
      </div>
    );
  }, [kit, selectSample, selectedSample]);
  return sampleBtnsMemo;
};
export { SampleBtnContainer as SampleBtns };

const SampleBtn: React.FC<SampleBtnProps> = ({ i, sample, selectSample, selected }) => {
  const { containerClass, startFunc, onClick } = useSampleBtn(selectSample, selected, i);
  const { onTouchStart, onMouseDown } = useTouchAndMouse(() => startFunc());
  const memo = useMemo(() => {
    const iconFunction = (icons as any)[sample.icon];
    return (
      <div
        className={containerClass}
        onTouchStart={onTouchStart}
        onMouseDown={onMouseDown}
        onClick={onClick}
        aria-label={sample.name}
      >
        {iconFunction ? iconFunction(sample.color) : null}
        <div className={`border border${i}`} />
        <div className="bgFlash" />
        <div className={`bgSelected bg${i}`} />
      </div>
    );
  }, [containerClass, i, onClick, onMouseDown, onTouchStart, sample]);
  return memo;
};
