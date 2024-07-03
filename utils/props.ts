import { KeyboardEventHandler } from "react";

export function focusable(activeClass:string, onClick?:Function) {
  const onKeyDown:KeyboardEventHandler<HTMLElement> = e => {
    if (e.key === 'Enter')
      e.currentTarget.classList.add(activeClass);
  };

  const onKeyUp:KeyboardEventHandler<HTMLElement> = e => {
    if (e.key === 'Enter') {
      e.currentTarget.classList.remove(activeClass);
      (e.currentTarget.click ?? onClick)?.();
    }
  };

  return {
    onKeyDown,
    onKeyUp,
    onClick,
    tabIndex: 0
  };
}
