import Header from "./Header/Header";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import Body from "./Body/Body";
import { useState } from "react";
const PageLayout = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  return (
    <div>
      <ReactNotifications />
      <Header setHeaderHeight={setHeaderHeight} />
      <Body headerHeight={headerHeight} />
    </div>
  );
};

export default PageLayout;
