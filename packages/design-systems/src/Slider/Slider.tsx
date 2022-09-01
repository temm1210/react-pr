import { useRect } from "@project/react-hooks";
import React, { useEffect, useState } from "react";
import { useValidation, UseValidationProps } from "./hooks";

import "./Slider.scss";

export type SliderOnChange = (value: number) => void;
export interface SliderProps {
  /** 도달할 수 있는 최소값 */
  min?: UseValidationProps["min"];
  /** 도달할 수 있는 최대값 */
  max?: UseValidationProps["max"];
  /** 초기값 */
  defaultValue?: UseValidationProps["defaultValue"];
  /** 증가나 감소시킬 값의 크기 */
  step?: number;
  /** slider controller의 크기(정사각형) */
  controllerSize?: number;
  /** slider rail의 height(track도 같이적용) */
  railHeight?: number;
  /** slider의 value가 변경될 때 실행할 callback 함수 */
  onChange?: SliderOnChange;
}

function Slider({
  min = 0,
  max = 100,
  defaultValue = min || 0,
  step = 1,
  controllerSize = 20,
  railHeight = 6,
  onChange,
}: SliderProps) {
  const [setSliderElement, sliderElementRect] = useRect();
  const [value, setValue] = useState(Math.max(min, defaultValue));

  // validation성공시 값을 업데이트하는 함수
  // update시 필요한 validation은 해당 함수에 모두 작성
  const updateValueOnCondition = (_value: number) => {
    if (_value > max || _value < min) return;

    const nextValue = min + Math.round((_value - min) / step) * step;

    setValue(nextValue);
  };

  // slider value값 계산담당
  const calculateNextValue = (distance: number, denominator: number) => {
    return Math.floor((distance * (max - min)) / denominator + min);
  };

  const convertToPercent = (_value: number) => {
    return `${Math.floor(((_value - min) * 100) / (max - min))}%`;
  };

  const onMove = (event: MouseEvent) => {
    event.preventDefault();

    const { width, left } = sliderElementRect();
    updateValueOnCondition(calculateNextValue(event.clientX - left, width));
  };

  const onMouseUp = (event: MouseEvent) => {
    event.preventDefault();

    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const onMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onMouseUp);

    const { width, left } = sliderElementRect();
    updateValueOnCondition(calculateNextValue(event.clientX - left, width));
  };

  useEffect(() => {
    onChange?.(value);
  }, [onChange, value]);

  useValidation({ max, min, defaultValue });

  const railStyles = {
    height: `${railHeight}px`,
  };
  const trackStyles = {
    width: convertToPercent(value),
    height: `${railHeight}px`,
  };

  const controllerStyles = {
    width: `${controllerSize}px`,
    height: `${controllerSize}px`,
    left: convertToPercent(value),
  };

  const sliderStyles = {
    padding: `${(controllerSize - railHeight) / 2}px 0`,
    height: `${railHeight}px`,
  };

  return (
    <div className="slider" onMouseDown={onMouseDown} style={sliderStyles} ref={setSliderElement}>
      <div className="slider__rail" style={railStyles} />
      <div className="slider__track" style={trackStyles} />
      <div
        style={controllerStyles}
        className="slider__controller"
        role="slider"
        aria-label="가로방향 슬라이더"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-orientation="horizontal"
        tabIndex={0}
      />
    </div>
  );
}

export default Slider;
