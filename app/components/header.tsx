import { Form, Link } from "@remix-run/react";
import Favicon from "../../public/favicon.svg";
import { useLoggedInUser } from "#app/utils/user.ts";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

export function Header() {
  return (
    <div className="flex h-16 text-gray-500 font-semibold sticky top-0 z-50">
      <div className="self-center flex flex-row justify-between w-full mx-32 lg:mx-64 xl:mx-96">
        <Link to="/" className="flex flex-row ">
          <div className="self-center">
            <img src={Favicon} alt="favicon" />
          </div>
          <div className="mt-1 ml-2 text-2xl font-semibold text-black">
            SWFT
          </div>
        </Link>
        {useLoggedInUser() ? (
          <Form action="/logout" method="POST">
            <AuthenticityTokenInput />
            <button className="h-10 w-20 rounded border border-black text-center self-center">
              Log Out
            </button>
          </Form>
        ) : (
          <Link to="/login">
            <button className="h-10 w-20 rounded border border-black text-center self-center">
              Log In
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
