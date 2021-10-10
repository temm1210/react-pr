import { useCallback, useRef } from "react";
import { useEvent } from "@project/react-hooks";

export interface Props {
  /** test */
  children: React.ReactNode;
  /** 상단에서 얼마나 떨어진 상태로 sticky가 진행될지 결정 */
  offset?: number;
}

function Sticky({ children, offset = 0 }: Props) {
  const containerRef = useRef<Element>();

  // const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);

  const assignRects = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const heightRect = heightRef.current?.getBoundingClientRect();
    const stickyRect = stickyRef.current?.getBoundingClientRect();

    if (!containerRect || !heightRect || !stickyRect) return null;
    return { containerRect, heightRect, stickyRect };
  };

  /**
   * calculatePositionHandlers method에서 return하는 타입
   * @typedef {Object} StickyHandlers
   * @property {() => boolean} isReachContainerBottom - sticky영역이 위로 올라가는 시점(viewport에서 container의 위치가 sticky element의 높이보다 작아질때)
   * @property {() => boolean} isReachScreenTop - sticky영역이 현재 viewport상단에 고정되는 시점(offset이 주어지면 그만큼 떨어진상태로 고정)
   */
  /**
   * sticky element의 위치를 확인하여 상태를 계산해주는 methods 모음
   * @return {StickyHandlers} 현재 상태를 계산해주는 methods
   */
  const calculatePositionHandlers = useCallback(() => {
    const rects = assignRects();
    if (!rects) return;

    const { stickyRect, containerRect, heightRect } = rects;
    const isReachContainerBottom = () => stickyRect?.height + offset >= containerRect?.bottom;
    const isReachScreenTop = () => heightRect.top < offset;

    return { isReachContainerBottom, isReachScreenTop };
  }, [offset]);

  /**
   * 현재 sticky element의 상태값을 사용하여 처리하는 함수
   */
  const update = useCallback(() => {
    const handlers = calculatePositionHandlers();

    console.log(handlers);
  }, [calculatePositionHandlers]);

  const handleUpdate = useCallback(() => {
    // raf처리
    update();
  }, [update]);

  useEvent("scroll", handleUpdate, { passive: true });
  useEvent("resize", handleUpdate);

  const assignContainerClientRect = useCallback((node: HTMLDivElement) => {
    const stickyContainer = node.parentElement?.closest(".sticky-container") || document.body;
    containerRef.current = stickyContainer;
  }, []);

  return (
    <div ref={assignContainerClientRect}>
      <div ref={heightRef} className="sticky-height" />
      <div ref={stickyRef} className="sticky">
        {children}
      </div>
    </div>
  );
}

export default Sticky;
