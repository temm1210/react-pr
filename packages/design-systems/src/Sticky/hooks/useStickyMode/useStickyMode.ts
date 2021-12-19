import { RefObject, useMemo, useRef, useCallback } from "react";
import { useClosetParent } from "@project/react-hooks";
import usePositionCalculators, { PositionCalculator } from "../usePositionCalculators";
import useStatusUpdaters, { StatusUpdateInfo } from "../useStatusUpdaters";
import { parentSelector } from "../../utils";
import { StickyMode } from "../../types";
import stickyRenderMode, { StickyModeComponent } from "./stickyRenderMode";

export type Rect = Pick<DOMRectReadOnly, "top" | "bottom" | "height" | "width">;

export type CallbackParameter = Record<keyof Rect, number>;
export type Callback = (rect: CallbackParameter) => void;

interface StickyModeProps {
  top: number;
  bottom: number;
  onStick?: Callback;
  onUnStick?: Callback;
}

export type StatusHandler = () => void;

export interface StickyModeValue {
  isStick: PositionCalculator;
  isReachContainerBottomToMode: PositionCalculator;
  stickyToContainerBottom: StatusHandler;
  stickyToModeOfScreen: StatusHandler;
  unStick: StatusHandler;
  render: StickyModeComponent;
}

export type UseStickyMode = Record<StickyMode, StickyModeValue>;
export interface UseStickyModeReturn extends StatusUpdateInfo {
  stickyModeMapper: UseStickyMode;
}
/**
 * Sticky의 mode에 따라 실행해야할 기능들을 return함
 */
const useStickyMode = ({ top = 0, bottom = 0, onStick, onUnStick }: StickyModeProps): UseStickyModeReturn => {
  const fakeRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const { parentNode, findParentFrom } = useClosetParent(`.${parentSelector}`);

  // scroll 위치에 따라 현재 엘리먼트의 위치값을 계산하는 handler
  const positionCalculators = usePositionCalculators(parentNode || document.body, fakeRef.current, stickyRef.current, {
    top,
    bottom,
  });

  const getRect = (ref: RefObject<Element | null>) => {
    return ref.current?.getBoundingClientRect();
  };

  const getStickyHandlerParameters = useCallback(() => {
    const stickyRect = getRect(stickyRef);
    const fakeRect = getRect(fakeRef);

    if (!stickyRect || !fakeRect) return;
    return { width: fakeRect.width, height: stickyRect.height, top, bottom };
  }, [bottom, top]);

  // sticky가 활성화 됐을때 실행할 callback
  const handleOnStick = useCallback(() => {
    const rect = getStickyHandlerParameters();
    if (!rect) return;
    onStick?.(rect);
  }, [getStickyHandlerParameters, onStick]);

  // sticky가 비 활성화 됐을때 실행할 callback
  const handleUnStick = useCallback(() => {
    const rect = getStickyHandlerParameters();
    if (!rect) return;
    onUnStick?.(rect);
  }, [getStickyHandlerParameters, onUnStick]);

  // 현재 엘리먼트의 상태값을 업데이트하는 handler와 상태 결과값을 return
  const [statusUpdateHandlers, { isSticky, isAbsolute }] = useStatusUpdaters({
    initIsSticky: !parentNode,
    onStick: handleOnStick,
    onUnStick: handleUnStick,
  });

  const renderByMode = stickyRenderMode({ fakeRef, stickyRef, findParentFrom });

  console.log("test:", positionCalculators()?.isReachScreenTop());
  const stickyModeMapper = useMemo(
    () => ({
      top: {
        isStick: () => positionCalculators()?.isReachScreenTop() || false,
        isReachContainerBottomToMode: () => positionCalculators()?.isReachContainerBottomToTop() || false,
        stickyToContainerBottom: () => statusUpdateHandlers?.stickToContainerBottom(),
        stickyToModeOfScreen: () => statusUpdateHandlers?.stickToScreenTop(),
        unStick: () => statusUpdateHandlers?.unStick(),
        render: renderByMode("top"),
      },
      bottom: {
        isStick: () => positionCalculators()?.isReachScreenBottom() || false,
        isReachContainerBottomToMode: () => positionCalculators()?.isReachContainerBottomToBottom() || false,
        stickyToContainerBottom: () => statusUpdateHandlers?.stickToContainerBottom(),
        stickyToModeOfScreen: () => statusUpdateHandlers?.stickyToScreenBottom(),
        unStick: () => statusUpdateHandlers?.unStick(),
        render: renderByMode("bottom"),
      },
    }),
    [positionCalculators, renderByMode, statusUpdateHandlers],
  );

  return { stickyModeMapper, isSticky, isAbsolute };
};

export default useStickyMode;