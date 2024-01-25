import Logo from "./Logo/Logo";
import { Divider } from "@nextui-org/react";
import Menu from "../Menu/Menu";

const Header = () => {
  return (
    <header>
      <nav className="flex p-7 items-stretch pl-20 bg-slate-800 gap-20">
        <Logo />
        <Divider orientation="vertical" className="h-auto bg-slate-600" />
        <Menu />
      </nav>
    </header>
  );
};

export default Header;
