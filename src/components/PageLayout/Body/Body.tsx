import { Outlet } from "react-router-dom";

type BodyProps = {
  headerHeight: number;
};
const Body = ({ headerHeight }: BodyProps) => {
  console.log(headerHeight);
  return (
    <div
      className="overflow-auto"
      style={{ height: `calc(100vh - ${headerHeight}px)` }}
    >
      <Outlet />
    </div>
  );
};

export default Body;
