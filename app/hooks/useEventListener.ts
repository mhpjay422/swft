import { useEffect } from "react";

// Custom hook to add an event listener
export const useEventListener = <T extends Event>(
  eventName: string,
  handler: (event: T) => void,
  element?: EventTarget
): void => {
  // Use effect to add an event listener
  useEffect(() => {
    // Define the target element (document, window, or custom element)
    const targetElement: EventTarget | undefined = element || document;

    // Check if required parameters and target element are available
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
  }, [eventName, handler, element]); // Include dependencies in useEffect
};
