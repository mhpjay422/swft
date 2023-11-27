import { Link } from "@remix-run/react";

export function Footer() {
  return (
    <div className="bg-white w-full sticky bottom-0 h-16">
      <div className="flex flex-row justify-between mx-32 lg:mx-64 xl:mx-96 pt-4">
        <div>© 2023 SWFT</div>
        <div className="flex mb-4">
          <Link
            to="https://www.linkedin.com/in/jason-gong-79772b126/"
            className="h-8 w-8 mr-20"
          >
            <img className="h-8 w-8" src="/linked.png" alt=""></img>
          </Link>
          <Link to="https://github.com/mhpjay422" className="h-8 w-8 mr-20">
            <img className="h-8 w-8" src="/github2.png" alt=""></img>
          </Link>
        </div>
      </div>
    </div>
  );
}
