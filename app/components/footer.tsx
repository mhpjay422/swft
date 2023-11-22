export function Footer() {
  return (
    <div className="bg-white w-full sticky bottom-0 h-16">
      <div className="flex flex-row justify-between mx-32 lg:mx-64 xl:mx-96 pt-4">
        <div>© 2023 SWFT</div>
        <div className="flex mb-4">
          <a
            className="h-8 w-8 mr-20"
            href="https://www.linkedin.com/in/jason-gong-79772b126/"
          >
            <img className="linkedin-img" src="linked.png" alt=""></img>
          </a>
          <a className="h-8 w-8" href="https://github.com/mhpjay422">
            <img className="github-img" src="github2.png" alt=""></img>
          </a>
        </div>
      </div>
    </div>
  );
}
