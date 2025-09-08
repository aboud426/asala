import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DirectionProvider } from "@/contexts/DirectionContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { RouteChangeLoader } from "@/components/ui/RouteChangeLoader";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Providers from "./pages/Providers";
import CreateProvider from "./pages/CreateProvider";
import ProviderDetails from "./pages/ProviderDetails";
import EditProvider from "./pages/EditProvider";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Languages from "./pages/Languages";
import Categories from "./pages/Categories";
import CategoriesTree from "./pages/CategoriesTree";
import ProductCategories from "./pages/ProductCategories";
import ProductCategoriesTree from "./pages/ProductCategoriesTree";
import Messages from "./pages/Messages";
import PostTypes from "./pages/PostTypes";
import Employees from "./pages/Employees";
import Roles from "./pages/Roles";
import RolePermissions from "./pages/RolePermissions";
import Permissions from "./pages/Permissions";
import Currencies from "./pages/Currencies";
import CreateProduct from "./pages/CreateProduct";
import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";
import Posts from "./pages/Posts";
import CreatePost from "./pages/CreatePost";
import PostDetails from "./pages/PostDetails";
import EditPost from "./pages/EditPost";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <DirectionProvider>
        <LoadingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <RouteChangeLoader />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/create" element={<CreateProduct />} />
                <Route path="/products/:id/edit" element={<EditProduct />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/posts/create" element={<CreatePost />} />
                <Route path="/posts/:id/edit" element={<EditPost />} />
                <Route path="/posts/:id" element={<PostDetails />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/providers/create" element={<CreateProvider />} />
                <Route path="/providers/:id/edit" element={<EditProvider />} />
                <Route path="/providers/:id" element={<ProviderDetails />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/languages" element={<Languages />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/tree" element={<CategoriesTree />} />
                <Route path="/product-categories" element={<ProductCategories />} />
                <Route path="/product-categories/tree" element={<ProductCategoriesTree />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/post-types" element={<PostTypes />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/roles/:roleId/permissions" element={<RolePermissions />} />
                <Route path="/permissions" element={<Permissions />} />
                <Route path="/currencies" element={<Currencies />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LoadingProvider>
      </DirectionProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
