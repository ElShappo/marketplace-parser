import { Button, Link } from "@nextui-org/react";
import React from "react";

const Logo = () => {
  return (
    <>
      <Button
        className="py-2 px-28 flex justify-center items-center h-auto w-[40vh]"
        color="primary"
        variant="shadow"
      >
        <img src="parse.png" width={50}></img>
        <div className="flex-1">
          <h1 className="text-5xl justify-center font-light flex w-full">
            <div className="pl-2">MParser</div>
          </h1>
          <div className="italic text-xs font-semibold">Parsing made easy</div>
        </div>
      </Button>
    </>
  );
};

export default Logo;
