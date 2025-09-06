import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DirectionProvider } from "@/contexts/DirectionContext";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Languages from "./pages/Languages";
import Categories from "./pages/Categories";
import CategoriesTree from "./pages/CategoriesTree";
import ProductCategories from "./pages/ProductCategories";
import ProductCategoriesTree from "./pages/ProductCategoriesTree";
import Messages from "./pages/Messages";
import Roles from "./pages/Roles";
import RolePermissions from "./pages/RolePermissions";
import Permissions from "./pages/Permissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <DirectionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/languages" element={<Languages />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/tree" element={<CategoriesTree />} />
              <Route path="/product-categories" element={<ProductCategories />} />
              <Route path="/product-categories/tree" element={<ProductCategoriesTree />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/roles/:roleId/permissions" element={<RolePermissions />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DirectionProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
