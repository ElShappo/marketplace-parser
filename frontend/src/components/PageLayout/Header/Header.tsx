import Logo from "./Logo/Logo";
import { Divider } from "@nextui-org/react";
import Menu from "./Menu/Menu";
import { useEffect, useRef } from "react";

type HeaderProps = {
  setHeaderHeight: React.Dispatch<React.SetStateAction<number>>;
};

const Header = ({ setHeaderHeight }: HeaderProps) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      setHeaderHeight((ref.current as HTMLElement).clientHeight);
    }
  }, [setHeaderHeight]);
  return (
    <header ref={ref}>
      <nav className="flex max-lg:flex-wrap p-7 max-sm:p-2 max-sm:py-4 items-stretch content-center justify-center pl-20 bg-slate-800 gap-20 max-lg:gap-10 max-sm:gap-5">
        <Logo />
        <Divider
          orientation="vertical"
          className="max-lg:hidden h-auto bg-slate-600"
        />
        <Menu />
      </nav>
    </header>
  );
};

export default Header;
