export default function TaskCompleteCheck() {
  return (
    <div className="w-4 h-4 mt-1.5 ml-0.5 mr-2.5 rounded-full bg-green-700 flex items-center">
      <svg
        data-slot="icon"
        fill="none"
        strokeWidth="2"
        stroke="#ffffff"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-3 h-3 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        ></path>
      </svg>
    </div>
  );
}
