import Header from "./Header/Header";
import { Outlet } from "react-router-dom";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
const PageLayout = () => {
  return (
    <div>
      <ReactNotifications />
      <Header />
      <Outlet />
    </div>
  );
};

export default PageLayout;
