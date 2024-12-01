import React from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Footer from './components/Footer';
import MemberDashboard from './components/Dashboard/MemberDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import MenuManagement from './components/Menu/MenuManagement';
import Menu from './components/Menu/Menu';
import Profile from './components/Profile/Profile';
import Orders from './components/Orders/Orders';
import Wallet from './components/Wallet/Wallet';

const Layout = () => {
  return (
    <div className="App">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

const NoFooterLayout = () => {
  return (
    <div className="App">
      <Navbar />
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "member/dashboard", element: <MemberDashboard /> },
      { path: "menu", element: <Menu /> },
      { path: "orders", element: <Orders /> },
      { path: "wallet", element: <Wallet /> },
    ]
  },
  {
    element: <NoFooterLayout />,
    children: [
      { path: "admin/menu", element: <MenuManagement /> },
      { path: "admin/dashboard", element: <AdminDashboard /> },
      { path: "profile", element: <Profile /> }
    ],
  },
], {
  future: {
    v7_startTransition: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
