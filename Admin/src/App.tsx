import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DirectionProvider } from "@/contexts/DirectionContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute";
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
import ProductsPages from "./pages/ProductsPages";
import ProductsPageViewer from "./pages/ProductsPageViewer";
import PostsPages from "./pages/PostsPages";
import PostsPageViewer from "./pages/PostsPageViewer";
import Regions from "./pages/Regions";
import Locations from "./pages/Locations";
import CreateLocation from "./pages/CreateLocation";
import LocationDetails from "./pages/LocationDetails";
import EditLocation from "./pages/EditLocation";
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
import Reels from "./pages/Reels";
import CreateReel from "./pages/CreateReel";
import ReelDetails from "./pages/ReelDetails";
import ReelPreview from "./components/ui/reel-preview";
import MapSelector from "./pages/MapSelector";
import Statistics from "./pages/Statistics";
import Images from "./pages/Images";
import Videos from "./pages/Videos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RichTextEditorPage from "./pages/RichTextEditor";

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
              <AuthProvider>
                <RouteChangeLoader />
                <Routes>
                  {/* Public routes - redirect to dashboard if authenticated */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />

                  {/* Protected routes - require authentication */}
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                  <Route path="/products/create" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
                  <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
                  <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                  <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
                  <Route path="/posts/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
                  <Route path="/posts/:id/edit" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
                  <Route path="/posts/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
                  <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
                  <Route path="/reels/create" element={<ProtectedRoute><CreateReel /></ProtectedRoute>} />
                  <Route path="/reels/:id/preview" element={<ProtectedRoute><ReelPreview /></ProtectedRoute>} />
                  <Route path="/reels/:id" element={<ProtectedRoute><ReelDetails /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                  <Route path="/providers" element={<ProtectedRoute><Providers /></ProtectedRoute>} />
                  <Route path="/providers/create" element={<ProtectedRoute><CreateProvider /></ProtectedRoute>} />
                  <Route path="/providers/:id/edit" element={<ProtectedRoute><EditProvider /></ProtectedRoute>} />
                  <Route path="/providers/:id" element={<ProtectedRoute><ProviderDetails /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/languages" element={<ProtectedRoute><Languages /></ProtectedRoute>} />
                  <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                  <Route path="/categories/tree" element={<ProtectedRoute><CategoriesTree /></ProtectedRoute>} />
                  <Route path="/product-categories" element={<ProtectedRoute><ProductCategories /></ProtectedRoute>} />
                  <Route path="/product-categories/tree" element={<ProtectedRoute><ProductCategoriesTree /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/post-types" element={<ProtectedRoute><PostTypes /></ProtectedRoute>} />
                  <Route path="/products-pages" element={<ProtectedRoute><ProductsPages /></ProtectedRoute>} />
                  <Route path="/products-pages/:id/view" element={<ProtectedRoute><ProductsPageViewer /></ProtectedRoute>} />
                  <Route path="/posts-pages" element={<ProtectedRoute><PostsPages /></ProtectedRoute>} />
                  <Route path="/posts-pages/:id/view" element={<ProtectedRoute><PostsPageViewer /></ProtectedRoute>} />
                  <Route path="/regions" element={<ProtectedRoute><Regions /></ProtectedRoute>} />
                  <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
                  <Route path="/locations/create" element={<ProtectedRoute><CreateLocation /></ProtectedRoute>} />
                  <Route path="/locations/:id" element={<ProtectedRoute><LocationDetails /></ProtectedRoute>} />
                  <Route path="/locations/edit/:id" element={<ProtectedRoute><EditLocation /></ProtectedRoute>} />
                  <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                  <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                  <Route path="/roles/:roleId/permissions" element={<ProtectedRoute><RolePermissions /></ProtectedRoute>} />
                  <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
                  <Route path="/currencies" element={<ProtectedRoute><Currencies /></ProtectedRoute>} />
                  <Route path="/images" element={<ProtectedRoute><Images /></ProtectedRoute>} />
                  <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
                  <Route path="/map-selector" element={<ProtectedRoute><MapSelector /></ProtectedRoute>} />
                  <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/rich-text-editor" element={<ProtectedRoute><RichTextEditorPage /></ProtectedRoute>} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LoadingProvider>
      </DirectionProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
