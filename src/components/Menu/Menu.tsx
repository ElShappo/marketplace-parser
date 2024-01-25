import { Button } from "@nextui-org/react";

const Menu = () => {
  return (
    <section className="flex items-center justify-evenly w-full">
      <Button className="px-12 py-6" color="primary" variant="shadow">
        Products
      </Button>
      <Button className="px-12 py-6" color="primary" variant="shadow">
        Charts
      </Button>
      <Button className="px-12 py-6" color="primary" variant="shadow">
        Info
      </Button>
    </section>
  );
};

export default Menu;
