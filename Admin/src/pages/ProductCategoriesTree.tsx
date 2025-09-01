import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChevronDown,
    ShoppingBag,
    Globe,
    Package,
    Edit,
    Eye,
    Power,
    Trash2,
    MoreHorizontal,
    Plus,
    ArrowLeft,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import productCategoryService, {
    ProductCategory,
    ProductCategoryTreeDto,
    UpdateProductCategoryDto,
} from '@/services/productCategoryService';

// Tree Node Component for rendering hierarchical product categories
interface TreeNodeProps {
    productCategory: ProductCategoryTreeDto;
    level: number;
    isRTL: boolean;
    onEdit: (productCategory: ProductCategoryTreeDto) => void;
    onViewDetails: (productCategory: ProductCategoryTreeDto) => void;
    onToggleStatus: (id: number) => void;
    onDelete: (id: number) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
    productCategory,
    level,
    isRTL,
    onEdit,
    onViewDetails,
    onToggleStatus,
    onDelete
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = productCategory.children && productCategory.children.length > 0;

    const getStatusBadge = (isActive: boolean) => {
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                {isRTL ? (isActive ? 'نشط' : 'غير نشط') : (isActive ? 'Active' : 'Inactive')}
            </div>
        );
    };

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-2 p-3 hover:bg-muted/50 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : 'flex-row'
                    }`}
                style={{ paddingLeft: isRTL ? '12px' : `${12 + level * 24}px`, paddingRight: isRTL ? `${12 + level * 24}px` : '12px' }}
            >
                {/* Expand/Collapse Button */}
                {hasChildren && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    </Button>
                )}

                {/* Product Category Icon */}
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-4 w-4 text-primary-foreground" />
                </div>

                {/* Product Category Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{productCategory.name}</span>
                        {getStatusBadge(productCategory.isActive)}
                    </div>
                    {productCategory.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                            {productCategory.description}
                        </p>
                    )}
                    {productCategory.localizations && productCategory.localizations.length > 0 && (
                        <div className="flex gap-1 mt-1">
                            {productCategory.localizations.slice(0, 3).map((loc) => (
                                <Badge key={loc.id} variant="outline" className="text-xs h-5">
                                    <Globe className="h-3 w-3 mr-1" />
                                    {loc.languageCode}
                                </Badge>
                            ))}
                            {productCategory.localizations.length > 3 && (
                                <Badge variant="outline" className="text-xs h-5">
                                    +{productCategory.localizations.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => onViewDetails(productCategory)}
                        >
                            <Eye className="h-4 w-4" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => onEdit(productCategory)}
                        >
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => onToggleStatus(productCategory.id)}
                        >
                            <Power className="h-4 w-4" />
                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => onDelete(productCategory.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            {isRTL ? 'حذف' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className={isRTL ? 'mr-4' : 'ml-4'}>
                    {productCategory.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            productCategory={child}
                            level={level + 1}
                            isRTL={isRTL}
                            onEdit={onEdit}
                            onViewDetails={onViewDetails}
                            onToggleStatus={onToggleStatus}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductCategoriesTree: React.FC = () => {
    const { isRTL } = useDirection();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Query for product category tree
    const { data: productCategoryTree, isLoading: isTreeLoading } = useQuery({
        queryKey: ['product-categories-tree'],
        queryFn: () => productCategoryService.getProductCategoryTree(),
    });

    // Query for all product categories to calculate stats
    const { data: allProductCategoriesData } = useQuery({
        queryKey: ['product-categories-all'],
        queryFn: () => productCategoryService.getProductCategories({ pageSize: 1000 }),
    });

    // Mutations
    const toggleMutation = useMutation({
        mutationFn: productCategoryService.toggleProductCategoryActivation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories-all'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories-tree'] });
            toast.success(isRTL ? 'تم تحديث حالة فئة المنتج' : 'Product category status updated');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة فئة المنتج' : 'Error updating product category status'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: productCategoryService.deleteProductCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories-all'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories-dropdown'] });
            queryClient.invalidateQueries({ queryKey: ['product-categories-tree'] });
            toast.success(isRTL ? 'تم حذف فئة المنتج بنجاح' : 'Product category deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف فئة المنتج' : 'Error deleting product category'));
        },
    });

    // Handler functions
    const handleEdit = (treeProductCategory: ProductCategoryTreeDto) => {
        // Navigate to product categories page with edit mode
        navigate('/product-categories', {
            state: {
                editProductCategory: {
                    ...treeProductCategory,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            }
        });
    };

    const handleViewDetails = (treeProductCategory: ProductCategoryTreeDto) => {
        // Navigate to product categories page with view mode
        navigate('/product-categories', {
            state: {
                viewProductCategory: {
                    ...treeProductCategory,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            }
        });
    };

    // Stats calculation
    const stats = {
        total: allProductCategoriesData?.totalCount || 0,
        active: allProductCategoriesData?.items.filter(c => c.isActive).length || 0,
        inactive: allProductCategoriesData?.items.filter(c => !c.isActive).length || 0,
        rootCategories: productCategoryTree?.length || 0,
    };

    // Calculate total product categories in tree (including children)
    const countTotalInTree = (productCategories: ProductCategoryTreeDto[]): number => {
        return productCategories.reduce((total, productCategory) => {
            return total + 1 + countTotalInTree(productCategory.children || []);
        }, 0);
    };

    const totalInTree = productCategoryTree ? countTotalInTree(productCategoryTree) : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                                    <Package className="h-5 w-5 text-primary-foreground" />
                                </div>
                                {isRTL ? 'عرض شجرة فئات المنتجات' : 'Product Categories Tree View'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isRTL
                                    ? 'عرض هرمي لجميع فئات المنتجات مع إمكانية التفاعل والتحرير'
                                    : 'Hierarchical view of all product categories with interaction and editing capabilities'
                                }
                            </p>
                        </div>
                    </div>
                    <div className='flex gap-2 justify-evenly'>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/product-categories')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {isRTL ? 'العودة لفئات المنتجات' : 'Back to Product Categories'}
                        </Button>
                        <Button
                            className="gradient-primary flex items-center gap-2"
                            onClick={() => navigate('/product-categories')}
                        >
                            <Plus className="h-4 w-4" />
                            {isRTL ? 'إضافة فئة منتج جديدة' : 'Add New Product Category'}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'إجمالي فئات المنتجات' : 'Total Product Categories'}
                                    </p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
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
                                        {isRTL ? 'فئات المنتجات النشطة' : 'Active Product Categories'}
                                    </p>
                                    <p className="text-2xl font-bold text-success">{stats.active}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-success" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'فئات المنتجات غير النشطة' : 'Inactive Product Categories'}
                                    </p>
                                    <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'فئات المنتجات الرئيسية' : 'Root Product Categories'}
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.rootCategories}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tree View Content */}
                <Card className="border-0 shadow-elegant">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            {isRTL ? 'هيكل فئات المنتجات' : 'Product Category Structure'}
                            <Badge variant="secondary" className="ml-2">
                                {stats.rootCategories} {isRTL ? 'فئة رئيسية' : 'root categories'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isTreeLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className={isRTL ? 'mr-3' : 'ml-3'}>
                                    {isRTL ? 'جاري تحميل الشجرة...' : 'Loading tree...'}
                                </span>
                            </div>
                        ) : !productCategoryTree || productCategoryTree.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Package className="h-16 w-16 mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">
                                    {isRTL ? 'لا توجد فئات منتجات' : 'No Product Categories Found'}
                                </h3>
                                <p className="text-sm text-center mb-4">
                                    {isRTL
                                        ? 'لم يتم العثور على أي فئات منتجات لعرضها في الشجرة'
                                        : 'No product categories found to display in the tree view'
                                    }
                                </p>
                                <Button
                                    className="gradient-primary"
                                    onClick={() => navigate('/product-categories')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {isRTL ? 'إضافة فئة منتج جديدة' : 'Add First Product Category'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {productCategoryTree.map((productCategory) => (
                                    <TreeNode
                                        key={productCategory.id}
                                        productCategory={productCategory}
                                        level={0}
                                        isRTL={isRTL}
                                        onEdit={handleEdit}
                                        onViewDetails={handleViewDetails}
                                        onToggleStatus={(id) => toggleMutation.mutate(id)}
                                        onDelete={(id) => deleteMutation.mutate(id)}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ProductCategoriesTree;
