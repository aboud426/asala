import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { ProductDto, PaginatedResult, CurrencyDropdownDto, productService } from '@/services/productService';

// Default placeholder image as data URI
const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMyA3VjE3QzMgMTguMTA0NiAzLjg5NTQzIDE5IDUgMTlIMTlDMjAuMTA0NiAxOSAyMSAxOC4xMDQ2IDIxIDE3VjdNMyA3QzMgNS44OTU0MyAzLjg5NTQzIDUgNSA1SDE5QzIwLjEwNDYgNSAyMSA1Ljg5NTQzIDIxIDdNMyA3SDIxTTkgMTNIMTUiIHN0cm9rZT0iIzY4Nzc4NyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";

// Product Image Component with error handling
const ProductImage: React.FC<{ product: ProductDto | null; size?: 'sm' | 'md' | 'lg' }> = ({ product, size = 'sm' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const imageToShow = (product?.mediaUrls?.[0] && !imageError) ? product.mediaUrls[0] : DEFAULT_PRODUCT_IMAGE;

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border border-border/20`}>
      <img
        src={imageToShow}
        alt={product?.name || 'Product'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

const Products: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ProductDto> | null>(null);
  const [currencies, setCurrencies] = useState<CurrencyDropdownDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const handleCreateProduct = () => {
    navigate('/products/create');
  };

  const handleViewProduct = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleEditProduct = (productId: number) => {
    navigate(`/products/${productId}/edit`);
  };

  const fetchCurrencies = useCallback(async () => {
    try {
      const currenciesData = await productService.getCurrenciesDropdown();
      setCurrencies(currenciesData);
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
      // Don't show error for currencies as it's not critical
    }
  }, []);

  const fetchProducts = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const result = await productService.getProducts({
        page,
        pageSize,
        languageCode: isRTL ? 'ar' : 'en',
        activeOnly: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      });

      setPaginatedResult(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, isRTL, statusFilter]);

  useEffect(() => {
    fetchProducts(1);
    fetchCurrencies();
  }, [fetchProducts, fetchCurrencies]);

  // Get current products
  const products = paginatedResult?.items || [];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.localizedName && product.localizedName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCurrency = currencyFilter === 'all' || product.currencyId.toString() === currencyFilter;
    
    return matchesSearch && matchesCurrency;
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (paginatedResult?.totalPages || 1)) {
      fetchProducts(page);
    }
  };

  const handlePrevious = () => {
    if (paginatedResult?.hasPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (paginatedResult?.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
        {isActive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
      </Badge>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return <span className="text-destructive font-medium">{isRTL ? 'نفد المخزون' : 'Out of Stock'}</span>;
    } else if (quantity < 20) {
      return <span className="text-warning font-medium">{isRTL ? 'مخزون منخفض' : 'Low Stock'}</span>;
    }
    return <span className="text-success font-medium">{isRTL ? 'متوفر' : 'In Stock'}</span>;
  };

  const formatPrice = (price: number, currencyCode?: string, currencySymbol?: string) => {
    // If we have currency information, use it; otherwise fallback to USD
    const currency = currencyCode || 'USD';
    const symbol = currencySymbol || '$';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(price);
    } catch (error) {
      // If the currency code is not supported by Intl, use the symbol manually
      return `${symbol}${price.toFixed(2)}`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'إدارة المنتجات' : 'Products Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة كتالوج المنتجات والمخزون' : 'Manage your product catalog and inventory'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(currentPage)}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            <Button onClick={handleCreateProduct} className="gap-2">
              <Plus className="w-4 h-4" />
              {isRTL ? 'إضافة منتج جديد' : 'Add New Product'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProducts(currentPage)}
                disabled={loading}
                className="ml-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isRTL ? 'إعادة المحاولة' : 'Retry'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي المنتجات' : 'Total Products'}
                  </p>
                  <p className="text-2xl font-bold">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      paginatedResult?.totalCount || 0
                    )}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'منتجات نشطة' : 'Active Products'}
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      products.filter(p => p.isActive).length
                    )}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'مخزون منخفض' : 'Low Stock'}
                  </p>
                  <p className="text-2xl font-bold text-warning">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      products.filter(p => p.quantity > 0 && p.quantity < 20).length
                    )}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'نفد المخزون' : 'Out of Stock'}
                  </p>
                  <p className="text-2xl font-bold text-destructive">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      products.filter(p => p.quantity === 0).length
                    )}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={isRTL ? 'البحث في المنتجات...' : 'Search products...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'الحالة' : 'Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      {isRTL ? 'جميع الحالات' : 'All Status'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      {isRTL ? 'نشط' : 'Active'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'العملة' : 'Currency'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCurrencyFilter('all')}>
                      {isRTL ? 'جميع العملات' : 'All Currencies'}
                    </DropdownMenuItem>
                    {currencies.map((currency) => (
                      <DropdownMenuItem 
                        key={currency.id}
                        onClick={() => setCurrencyFilter(currency.id.toString())}
                      >
                        {currency.symbol} {currency.code} - {currency.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredProducts.length} منتج` : `${filteredProducts.length} Products`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'المنتج' : 'Product'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'المزود' : 'Provider'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'السعر والعملة' : 'Price & Currency'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'المخزون' : 'Stock'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton rows
                  Array.from({ length: pageSize }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="w-12 h-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {isRTL ? 'لا توجد منتجات' : 'No products found'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                            <ProductImage product={product} />
                            <div>
                              <p className="font-medium">{isRTL && product.localizedName ? product.localizedName : product.name}</p>
                              <p className="text-sm text-muted-foreground">#{product.id}</p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground max-w-xs truncate" title={product.description}>
                                  {isRTL && product.localizedDescription ? product.localizedDescription : product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <Badge variant="outline">
                            {product.categoryName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <Badge variant="secondary">
                            {product.providerName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {formatPrice(product.price, product.currencyCode, product.currencySymbol)}
                            </p>
                            {product.currencyName && (
                              <p className="text-xs text-muted-foreground">
                                {product.currencyCode} - {product.currencyName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="space-y-1">
                            <p className="font-medium">{product.quantity}</p>
                            {getStockStatus(product.quantity)}
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          {getStatusBadge(product.isActive)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleViewProduct(product.id)}
                              >
                                <Eye className="h-4 w-4" />
                                {isRTL ? 'عرض التفاصيل' : 'View Details'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleEditProduct(product.id)}
                              >
                                <Edit className="h-4 w-4" />
                                {isRTL ? 'تحرير' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                {isRTL ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {paginatedResult && !loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isRTL ? 'عرض' : 'Showing'} {((currentPage - 1) * pageSize) + 1} {isRTL ? 'إلى' : 'to'} {Math.min(currentPage * pageSize, paginatedResult.totalCount)} {isRTL ? 'من' : 'of'} {paginatedResult.totalCount} {isRTL ? 'منتج' : 'products'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={!paginatedResult.hasPreviousPage}
              >
                <ChevronLeft className="w-4 h-4" />
                {isRTL ? 'السابق' : 'Previous'}
              </Button>

              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'صفحة' : 'Page'} {currentPage} {isRTL ? 'من' : 'of'} {paginatedResult.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!paginatedResult.hasNextPage}
              >
                {isRTL ? 'التالي' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;