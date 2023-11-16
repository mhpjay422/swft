import { Link } from "@remix-run/react";
import Favicon from "../../public/favicon.svg";

export function Header() {
  return (
    <div className="flex h-16 text-gray-500 font-semibold sticky top-0 z-50">
      <div className="self-center flex flex-row justify-between w-full lg:mx-64 xl:mx-96">
        <Link to="/" className="flex flex-row ">
          <div className="self-center">
            <img src={Favicon} alt="favicon" />
          </div>
          <div className="mt-1 ml-2 text-2xl font-semibold text-black">
            SWFT
          </div>
        </Link>
        <button className="h-10 w-20 rounded border border-black">
          <Link to="/login">Log In</Link>
        </button>
      </div>
    </div>
  );
}
