import React from "react";
import { Button } from "@nextui-org/react";
import Logo from "./Logo/Logo";

const Header = () => {
  return (
    <header>
      <nav className="flex p-7 bg-slate-800">
        <Logo />
      </nav>
    </header>
  );
};

export default Header;
