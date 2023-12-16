import { useEffect } from "react";

// Custom hook to add an event listener
export const useEventListener = <T extends Event>(
  eventName: string,
  handler: (event: T) => void,
  element?: EventTarget
): void => {
  // Check if window is defined (i.e., we're in a browser environment)
  const targetElement: EventTarget | undefined =
    typeof window !== "undefined" ? element || window : element;

  useEffect(() => {
    // Ensure the required parameters are provided
    if (!eventName || !handler || !targetElement) return;

    // Callback function to handle the event
    const callback = (event: Event) => {
      handler(event as T); // Type assertion to the expected type
    };

    // Add the event listener
    targetElement.addEventListener(eventName, callback);

    // Cleanup: Remove the event listener on component unmount
    return () => {
      targetElement.removeEventListener(eventName, callback);
    };
  }, [eventName, handler, targetElement]);
};
