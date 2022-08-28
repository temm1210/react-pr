import { render, screen, fireEvent } from "@testing-library/react";
import Slider from "../Slider";

describe("Slider component test", () => {
  it("role이 slider인 tag가 존재한다.", () => {
    render(<Slider />);

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("aria값이 주어진 property에 맞게 설정되어야 한다.", () => {
    const min = 10;
    const max = 200;
    const defaultValue = 30;

    render(<Slider min={min} max={max} defaultValue={defaultValue} />);

    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-valuenow")).toBe(`${defaultValue}`);
    expect(slider.getAttribute("aria-valuemax")).toBe(`${max}`);
    expect(slider.getAttribute("aria-valuemin")).toBe(`${min}`);
  });

  it("controller가 있는 지점에서의 값(style, value)이 올바르게 계산되어야한다.", () => {
    const max = 200;
    const min = 10;

    const { container, getByRole } = render(<Slider min={min} max={max} />);

    const sliderContainer = container.getElementsByClassName("slider")[0];

    const left = 40;
    const width = 300;

    sliderContainer.getBoundingClientRect = jest.fn(() => {
      return {
        width,
        height: 10,
        top: 0,
        left,
        bottom: 0,
        right: 0,
      } as DOMRect;
    });

    const controller = getByRole("slider");
    const sliderTack = container.getElementsByClassName("slider__track")[0];

    console.log("sliderContainer:", sliderContainer);

    // minxClientX <= clientX <= maxClientX
    const maxClientX = width + left;
    const minxClientX = left;

    // 초기 값
    expect(controller).toHaveAttribute("aria-valuenow", `${min}`);
    expect(controller).toHaveStyle(`left:0%`);
    expect(sliderTack).toHaveStyle(`width:0%`);

    // controller를 rail의 특정 부분에 click시
    fireEvent.mouseDown(controller, { clientX: 200 });
    fireEvent.mouseUp(controller);

    expect(controller).toHaveAttribute("aria-valuenow", `${111}`);
    expect(controller).toHaveStyle(`left:53%`);
    expect(sliderTack).toHaveStyle(`width:53%`);

    // controller를 start지점으로 drag시
    fireEvent.mouseDown(controller, { clientX: 150 });
    fireEvent.mouseMove(controller, { clientX: minxClientX });
    fireEvent.mouseUp(controller);

    expect(controller).toHaveAttribute("aria-valuenow", `${min}`);
    expect(controller).toHaveStyle(`left:0%`);
    expect(sliderTack).toHaveStyle(`width:0%`);

    // controller를 rail의 특정(min < rail < max) 부분에 drag시
    fireEvent.mouseDown(controller, { clientX: 0 });
    fireEvent.mouseMove(controller, { clientX: 150 });
    fireEvent.mouseUp(controller);

    expect(controller).toHaveAttribute("aria-valuenow", `${79}`);
    expect(controller).toHaveStyle(`left:36%`);
    expect(sliderTack).toHaveStyle(`width:36%`);

    // controller를 끝까지 drag시
    fireEvent.mouseDown(controller, { clientX: 0 });
    fireEvent.mouseMove(controller, { clientX: maxClientX });
    fireEvent.mouseUp(controller);

    expect(controller).toHaveAttribute("aria-valuenow", `${max}`);
    expect(controller).toHaveStyle(`left:100%`);
    expect(sliderTack).toHaveStyle(`width:100%`);
  });

  it("max <= min 일시 error를 발생시킨다.", () => {
    expect(() => render(<Slider min={200} max={100} />)).toThrowError("'max prop' must be greater than 'min prop'");
    expect(() => render(<Slider min={200} max={200} />)).toThrowError("'max prop' must be greater than 'min prop'");
  });

  it("defaultValue >= min, defaultValue <=max 이어야 한다.", () => {
    // defaultValue validation전에 max, min먼저 validation 확인
    expect(() => render(<Slider min={200} max={100} defaultValue={100} />)).toThrowError(
      "'max prop' must be greater than 'min prop'",
    );

    expect(() => render(<Slider min={100} max={300} defaultValue={50} />)).toThrowError(
      "'defaultValue prop' must be equal or greater than 'min prop'",
    );

    // 모든 validation 통과시에는 error를 던지면안됨
    expect(() => render(<Slider min={100} max={300} defaultValue={100} />)).not.toThrowError();
  });
});
