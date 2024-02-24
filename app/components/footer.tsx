export function Footer() {
  return (
    <div
      className={`absolute z-9999 w-full bottom-0 h-16 border-t border-gray-200 ${
        process.env.NODE_ENV === "production" ? "bg-gray-50" : "bg-blue-100"
      }`}
    >
      <div className="flex flex-row justify-between mx-32 lg:mx-64 xl:mx-96 pt-4">
        <div className="whitespace-nowrap flex-shrink-0 mr-10">© 2023 SWFT</div>
        <div className="flex mb-4">
          <a
            href="https://www.linkedin.com/in/jason-gong-79772b126/"
            className="h-8 w-8 mr-20"
            target="_blank"
            rel="noreferrer"
          >
            <img className="h-8 w-8" src="/linked.png" alt=""></img>
          </a>
          <a
            href="https://github.com/mhpjay422"
            className="h-8 w-8 mr-20"
            target="_blank"
            rel="noreferrer"
          >
            <img className="h-8 w-8" src="/github2.png" alt=""></img>
          </a>
        </div>
      </div>
    </div>
  );
}
