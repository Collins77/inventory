import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import StoresPage from "./pages/StoresPage";
import StoreDetailsPage from "./pages/StoreDetailsPage";
import ProductsPage from "./pages/ProductsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:storeId" element={<StoreDetailsPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Route>
    </Routes>
  );
}