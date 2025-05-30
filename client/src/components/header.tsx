import { NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";
import profile from "../assets/profile.svg";

function Header(): JSX.Element {
  return (
    <>
      <header className="flex items-center justify-between p-2 sm:p-4 md:px-8 md:py-4">
        <div className="flex items-center">
          <img src={logo} alt="logo" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14" />
          <span className="transition ease-in-out duration-200 hover:text-sunset text-lg sm:text-2xl md:text-4xl">Classical Review</span>
        </div>
        <div>
          <NavLink to="/user">
            <img
              src={profile}
              alt="profile"
              className="transition ease-in-out duration-200 hover:scale-125 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            />
          </NavLink>
        </div>
      </header>
    </>
  )
}

export default Header;