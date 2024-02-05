import { Spinner } from "@nextui-org/react";

type LoaderProps = {
  label: string;
};
const Loader = ({ label }: LoaderProps) => {
  return (
    <div className="h-full flex justify-center items-center">
      <Spinner
        color="primary"
        className="flex-auto text-white"
        label={label}
        labelColor="primary"
      />
    </div>
  );
};

export default Loader;
