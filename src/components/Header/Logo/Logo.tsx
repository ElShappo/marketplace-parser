import { Button } from "@nextui-org/react";

const Logo = () => {
  return (
    <>
      <Button
        className="py-2 px-28 max-sm:px-4 flex justify-center items-center h-auto"
        color="primary"
        variant="shadow"
      >
        <img src="parse.png" width={50}></img>
        <div className="flex-1">
          <h1 className="text-5xl max-lg:text-3xl max-sm:text-2xl justify-center font-light flex w-full">
            <div className="pl-2">MParser</div>
          </h1>
          <div className="italic text-xs font-semibold">Parsing made easy</div>
        </div>
      </Button>
    </>
  );
};

export default Logo;
