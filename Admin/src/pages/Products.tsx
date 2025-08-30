import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';

const productsData = [
  {
    id: 'PRD-001',
    name: 'Smartphone Pro Max',
    nameAr: 'هاتف ذكي برو ماكس',
    category: 'Electronics',
    categoryAr: 'إلكترونيات',
    price: '$999.00',
    stock: 45,
    status: 'active',
    statusAr: 'نشط',
    sales: 234,
    image: '/placeholder.svg',
  },
  {
    id: 'PRD-002',
    name: 'Wireless Headphones',
    nameAr: 'سماعات لاسلكية',
    category: 'Electronics',
    categoryAr: 'إلكترونيات',
    price: '$199.00',
    stock: 12,
    status: 'active',
    statusAr: 'نشط',
    sales: 187,
    image: '/placeholder.svg',
  },
  {
    id: 'PRD-003',
    name: 'Smart Watch',
    nameAr: 'ساعة ذكية',
    category: 'Electronics',
    categoryAr: 'إلكترونيات',
    price: '$299.00',
    stock: 0,
    status: 'out_of_stock',
    statusAr: 'نفد المخزون',
    sales: 156,
    image: '/placeholder.svg',
  },
  {
    id: 'PRD-004',
    name: 'Laptop Backpack',
    nameAr: 'حقيبة لابتوب',
    category: 'Accessories',
    categoryAr: 'إكسسوارات',
    price: '$79.99',
    stock: 23,
    status: 'active',
    statusAr: 'نشط',
    sales: 89,
    image: '/placeholder.svg',
  },
  {
    id: 'PRD-005',
    name: 'Gaming Mouse',
    nameAr: 'فأرة الألعاب',
    category: 'Electronics',
    categoryAr: 'إلكترونيات',
    price: '$89.00',
    stock: 67,
    status: 'draft',
    statusAr: 'مسودة',
    sales: 0,
    image: '/placeholder.svg',
  },
];

const statusConfig = {
  active: { 
    color: 'bg-success text-success-foreground', 
    icon: TrendingUp 
  },
  out_of_stock: { 
    color: 'bg-destructive text-destructive-foreground', 
    icon: AlertCircle 
  },
  draft: { 
    color: 'bg-muted text-muted-foreground', 
    icon: TrendingDown 
  },
};

const Products: React.FC = () => {
  const { isRTL } = useDirection();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string, statusAr: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {isRTL ? statusAr : status.replace('_', ' ')}
      </Badge>
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return <span className="text-destructive font-medium">{isRTL ? 'نفد المخزون' : 'Out of Stock'}</span>;
    } else if (stock < 20) {
      return <span className="text-warning font-medium">{isRTL ? 'مخزون منخفض' : 'Low Stock'}</span>;
    }
    return <span className="text-success font-medium">{isRTL ? 'متوفر' : 'In Stock'}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة المنتجات' : 'Products Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة كتالوج المنتجات والمخزون' : 'Manage your product catalog and inventory'}
            </p>
          </div>
          <Button className="gradient-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة منتج جديد' : 'Add New Product'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي المنتجات' : 'Total Products'}
                  </p>
                  <p className="text-2xl font-bold">1,234</p>
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
                  <p className="text-2xl font-bold text-success">987</p>
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
                  <p className="text-2xl font-bold text-warning">23</p>
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
                  <p className="text-2xl font-bold text-destructive">12</p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
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
                    <DropdownMenuItem onClick={() => setStatusFilter('out_of_stock')}>
                      {isRTL ? 'نفد المخزون' : 'Out of Stock'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
                      {isRTL ? 'مسودة' : 'Draft'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'الفئة' : 'Category'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                      {isRTL ? 'جميع الفئات' : 'All Categories'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('Electronics')}>
                      {isRTL ? 'إلكترونيات' : 'Electronics'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('Accessories')}>
                      {isRTL ? 'إكسسوارات' : 'Accessories'}
                    </DropdownMenuItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'المنتج' : 'Product'}</TableHead>
                  <TableHead>{isRTL ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                  <TableHead>{isRTL ? 'المخزون' : 'Stock'}</TableHead>
                  <TableHead>{isRTL ? 'المبيعات' : 'Sales'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{isRTL ? product.nameAr : product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{isRTL ? product.categoryAr : product.category}</TableCell>
                    <TableCell className="font-medium">{product.price}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{product.stock}</p>
                        {getStockStatus(product.stock)}
                      </div>
                    </TableCell>
                    <TableCell>{product.sales}</TableCell>
                    <TableCell>{getStatusBadge(product.status, product.statusAr)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            {isRTL ? 'حذف' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Products;