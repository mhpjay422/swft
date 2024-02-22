import { type RefObject, useEffect } from "react";

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  onClickOutside: (event: MouseEvent) => void,
  ignoreClassName: string // This is a new parameter to specify which clicks to ignore based on class name
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let targetElement = event.target as HTMLElement;

      // Check if the click is inside the ignore element by class name
      if (targetElement.closest(`.${ignoreClassName}`)) {
        // If the click is on an element with the ignore class, do nothing
        return;
      }

      // Proceed with the original logic if the click is outside the ref element
      if (ref.current && !ref.current.contains(targetElement)) {
        onClickOutside(event);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClickOutside, ignoreClassName]); // Add ignoreClassName to the dependency array
};
