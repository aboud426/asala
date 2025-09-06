import React, { useState, useCallback } from 'react';
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
    ChevronRight,
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
    Expand,
    Shrink,
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
    expandedNodes: Set<number>;
    onToggleExpanded: (id: number) => void;
    isLastChild?: boolean;
    parentConnections?: boolean[];
}

const TreeNode: React.FC<TreeNodeProps> = ({
    productCategory,
    level,
    isRTL,
    onEdit,
    onViewDetails,
    onToggleStatus,
    onDelete,
    expandedNodes,
    onToggleExpanded,
    isLastChild = false,
    parentConnections = []
}) => {
    const hasChildren = productCategory.children && productCategory.children.length > 0;
    const isExpanded = expandedNodes.has(productCategory.id);

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

    // Generate tree connection lines
    const renderTreeLines = () => {
        const lines = [];

        // Render parent connection lines
        for (let i = 0; i < level; i++) {
            const hasConnection = parentConnections[i];
            lines.push(
                <div
                    key={`line-${i}`}
                    className={`absolute top-0 bottom-0 w-px ${hasConnection ? 'bg-border' : ''}`}
                    style={{
                        left: isRTL ? 'auto' : `${16 + i * 24}px`,
                        right: isRTL ? `${16 + i * 24}px` : 'auto'
                    }}
                />
            );
        }

        // Render current level connections
        if (level > 0) {
            // Horizontal line to the node
            lines.push(
                <div
                    key="horizontal-line"
                    className="absolute top-6 w-4 h-px bg-border"
                    style={{
                        left: isRTL ? 'auto' : `${16 + (level - 1) * 24}px`,
                        right: isRTL ? `${16 + (level - 1) * 24}px` : 'auto'
                    }}
                />
            );

            // Vertical line (L-shaped connector)
            if (!isLastChild) {
                lines.push(
                    <div
                        key="vertical-line"
                        className="absolute top-0 bottom-0 w-px bg-border"
                        style={{
                            left: isRTL ? 'auto' : `${16 + (level - 1) * 24}px`,
                            right: isRTL ? `${16 + (level - 1) * 24}px` : 'auto'
                        }}
                    />
                );
            } else {
                lines.push(
                    <div
                        key="vertical-line-last"
                        className="absolute top-0 h-6 w-px bg-border"
                        style={{
                            left: isRTL ? 'auto' : `${16 + (level - 1) * 24}px`,
                            right: isRTL ? `${16 + (level - 1) * 24}px` : 'auto'
                        }}
                    />
                );
            }
        }

        return lines;
    };

    return (
        <div className="select-none relative">
            {/* Tree connection lines */}
            {renderTreeLines()}

            <div
                className={`relative flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg transition-all duration-200 border border-transparent hover:border-border/50 hover:shadow-sm ${isRTL ? 'flex-row-reverse' : 'flex-row'
                    }`}
                style={{
                    marginLeft: isRTL ? '0' : `${level * 24}px`,
                    marginRight: isRTL ? `${level * 24}px` : '0'
                }}
            >
                {/* Expand/Collapse Button */}
                {hasChildren ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 transition-all duration-200"
                        onClick={() => onToggleExpanded(productCategory.id)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-primary transition-transform duration-200" />
                        )}
                    </Button>
                ) : (
                    <div className="h-7 w-7 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-border"></div>
                    </div>
                )}

                {/* Product Category Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate text-foreground">
                            {productCategory.name}
                        </span>
                        {getStatusBadge(productCategory.isActive)}
                        {hasChildren && (
                            <Badge variant="secondary" className="text-xs h-5">
                                {productCategory.children.length} {isRTL ? 'عنصر' : 'items'}
                            </Badge>
                        )}
                    </div>
                    {/* {productCategory.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1 leading-relaxed">
                            {productCategory.description}
                        </p>
                    )}
                    {productCategory.localizations && productCategory.localizations.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                            {productCategory.localizations.slice(0, 3).map((loc) => (
                                <Badge key={loc.id} variant="outline" className="text-xs h-5 hover:bg-muted/50 transition-colors">
                                    {loc.languageCode}
                                </Badge>
                            ))}
                            {productCategory.localizations.length > 3 && (
                                <Badge variant="outline" className="text-xs h-5 hover:bg-muted/50 transition-colors">
                                    +{productCategory.localizations.length - 3}
                                </Badge>
                            )}
                        </div>
                    )} */}
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted/50 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} hover:bg-muted/50`}
                            onClick={() => onViewDetails(productCategory)}
                        >
                            <Eye className="h-4 w-4" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} hover:bg-muted/50`}
                            onClick={() => onEdit(productCategory)}
                        >
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} hover:bg-muted/50`}
                            onClick={() => onToggleStatus(productCategory.id)}
                        >
                            <Power className="h-4 w-4" />
                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'} hover:bg-destructive/10`}
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
                <div className="transition-all duration-300 ease-in-out">
                    {productCategory.children.map((child, index) => {
                        const isLastChildItem = index === productCategory.children.length - 1;
                        const newConnections = [...parentConnections];
                        if (level >= 0) {
                            newConnections[level] = !isLastChild;
                        }

                        return (
                            <TreeNode
                                key={child.id}
                                productCategory={child}
                                level={level + 1}
                                isRTL={isRTL}
                                onEdit={onEdit}
                                onViewDetails={onViewDetails}
                                onToggleStatus={onToggleStatus}
                                onDelete={onDelete}
                                expandedNodes={expandedNodes}
                                onToggleExpanded={onToggleExpanded}
                                isLastChild={isLastChildItem}
                                parentConnections={newConnections}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ProductCategoriesTree: React.FC = () => {
    const { isRTL } = useDirection();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State for expanded nodes
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    // Query for product category tree
    const { data: productCategoryTree, isLoading: isTreeLoading } = useQuery({
        queryKey: ['product-categories-tree'],
        queryFn: () => productCategoryService.getProductCategoryTree(),
    });

    // Initialize expanded nodes when tree data is loaded
    React.useEffect(() => {
        if (productCategoryTree && productCategoryTree.length > 0) {
            const allNodeIds = new Set<number>();
            const collectAllNodeIds = (productCategories: ProductCategoryTreeDto[]) => {
                productCategories.forEach(productCategory => {
                    allNodeIds.add(productCategory.id);
                    if (productCategory.children && productCategory.children.length > 0) {
                        collectAllNodeIds(productCategory.children);
                    }
                });
            };
            collectAllNodeIds(productCategoryTree);
            setExpandedNodes(allNodeIds);
        }
    }, [productCategoryTree]);

    // Helper functions for expand/collapse all
    const getAllNodeIds = useCallback((productCategories: ProductCategoryTreeDto[]): Set<number> => {
        const nodeIds = new Set<number>();
        const collect = (cats: ProductCategoryTreeDto[]) => {
            cats.forEach(cat => {
                nodeIds.add(cat.id);
                if (cat.children && cat.children.length > 0) {
                    collect(cat.children);
                }
            });
        };
        collect(productCategories);
        return nodeIds;
    }, []);

    const expandAll = useCallback(() => {
        if (productCategoryTree) {
            setExpandedNodes(getAllNodeIds(productCategoryTree));
        }
    }, [productCategoryTree, getAllNodeIds]);

    const collapseAll = useCallback(() => {
        setExpandedNodes(new Set());
    }, []);

    const toggleNodeExpanded = useCallback((nodeId: number) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

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
                            <h1 className="text-3xl font-bold text-foreground">
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
                    <div className='flex flex-wrap gap-2 justify-end'>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/product-categories')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {isRTL ? 'العودة لفئات المنتجات' : 'Back to Product Categories'}
                        </Button>

                        {/* Expand/Collapse Controls */}
                        <div className="flex gap-1 border rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={expandAll}
                                className="flex items-center gap-2 h-8 px-3 text-xs"
                                disabled={!productCategoryTree || productCategoryTree.length === 0}
                            >
                                <Expand className="h-3 w-3" />
                                {isRTL ? 'توسيع الكل' : 'Expand All'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={collapseAll}
                                className="flex items-center gap-2 h-8 px-3 text-xs"
                                disabled={!productCategoryTree || productCategoryTree.length === 0}
                            >
                                <Shrink className="h-3 w-3" />
                                {isRTL ? 'طي الكل' : 'Collapse All'}
                            </Button>
                        </div>

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
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'إجمالي فئات المنتجات' : 'Total Product Categories'}
                                </p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'فئات المنتجات النشطة' : 'Active Product Categories'}
                                </p>
                                <p className="text-2xl font-bold text-success">{stats.active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'فئات المنتجات غير النشطة' : 'Inactive Product Categories'}
                                </p>
                                <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'فئات المنتجات الرئيسية' : 'Root Product Categories'}
                                </p>
                                <p className="text-2xl font-bold text-blue-600">{stats.rootCategories}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tree View Content */}
                <Card className="border-0 shadow-elegant">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="text-lg flex items-center gap-3">
                                {isRTL ? 'هيكل فئات المنتجات' : 'Product Category Structure'}
                                <Badge variant="secondary" className="ml-2">
                                    {stats.rootCategories} {isRTL ? 'فئة رئيسية' : 'root categories'}
                                </Badge>
                            </CardTitle>

                            {/* Tree Controls */}
                            <div className="flex gap-1 border rounded-lg p-1 bg-background/50">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={expandAll}
                                    className="flex items-center gap-2 h-7 px-3 text-xs"
                                    disabled={!productCategoryTree || productCategoryTree.length === 0}
                                >
                                    <Expand className="h-3 w-3" />
                                    {isRTL ? 'توسيع الكل' : 'Expand All'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={collapseAll}
                                    className="flex items-center gap-2 h-7 px-3 text-xs"
                                    disabled={!productCategoryTree || productCategoryTree.length === 0}
                                >
                                    <Shrink className="h-3 w-3" />
                                    {isRTL ? 'طي الكل' : 'Collapse All'}
                                </Button>
                            </div>
                        </div>
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
                                    {isRTL ? 'إضافة فئة منتج جديدة' : 'Add First Product Category'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-1 bg-gradient-to-br from-muted/20 to-muted/5 p-4 rounded-xl border border-border/50">
                                {productCategoryTree.map((productCategory, index) => (
                                    <TreeNode
                                        key={productCategory.id}
                                        productCategory={productCategory}
                                        level={0}
                                        isRTL={isRTL}
                                        onEdit={handleEdit}
                                        onViewDetails={handleViewDetails}
                                        onToggleStatus={(id) => toggleMutation.mutate(id)}
                                        onDelete={(id) => deleteMutation.mutate(id)}
                                        expandedNodes={expandedNodes}
                                        onToggleExpanded={toggleNodeExpanded}
                                        isLastChild={index === productCategoryTree.length - 1}
                                        parentConnections={[]}
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
