import { Button, Link } from "@nextui-org/react";
import React from "react";

const Logo = () => {
  return (
    <>
      <Button className="p-8" color="primary">
        <h1 className="text-5xl font-light flex">
          <img src="parse.png" width={50}></img>
          <div className="pl-4">Parser.</div>
        </h1>
        <p className="flex items-end italic text-sm pl-2">Parsing made easy</p>
      </Button>
    </>
  );
};

export default Logo;
