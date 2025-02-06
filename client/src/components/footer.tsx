import github from "../assets/github.svg";

function Footer(): JSX.Element {
  return (
    <>
      <footer className="flex items-center justify-center p-2 sm:p-4 md:px-8 md:py-4">
        <div className="flex items-center">
          <a href="https://github.com/singsebbo/classical-review" target="_blank">
            <img src={github} alt="github logo" className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8" />
          </a>
        </div>
      </footer>
    </>
  )
}

export default Footer;