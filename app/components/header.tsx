export function Header() {
  return (
    <div className="flex h-16 text-gray-500 font-semibold">
      <div className="self-center flex flex-row justify-between w-full lg:mx-64 xl:mx-96">
        <div className="flex flex-row">
          <div className="self-center">
            <svg
              width="26"
              height="22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-labelledby="asana-logo-title"
            >
              <title id="swft-logo-title">SWFT</title>
              <path
                d="M18.559 11.605a5.158 5.158 0 1 0 0 10.317 5.158 5.158 0 0 0 0-10.317Zm-13.401.001a5.158 5.158 0 1 0 0 10.315 5.158 5.158 0 0 0 0-10.315Zm11.858-6.448a5.158 5.158 0 1 1-10.316 0 5.158 5.158 0 0 1 10.316 0Z"
                fill="#0074ff"
              ></path>
            </svg>
          </div>
          <div className="ml-2 text-2xl font-semibold text-black">SWFT</div>
        </div>
        <div>Log In</div>
      </div>
    </div>
  );
}
