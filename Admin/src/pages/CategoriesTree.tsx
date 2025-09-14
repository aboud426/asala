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
    Edit,
    Eye,
    Power,
    Trash2,
    MoreHorizontal,
    Plus,
    ArrowLeft,
    Expand,
    Shrink,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import categoryService, {
    Category,
    CategoryTreeDto,
    UpdateCategoryDto,
} from '@/services/categoryService';

// Tree Node Component for rendering hierarchical categories
interface TreeNodeProps {
    category: CategoryTreeDto;
    level: number;
    isRTL: boolean;
    onEdit: (category: CategoryTreeDto) => void;
    onViewDetails: (category: CategoryTreeDto) => void;
    onToggleStatus: (id: number) => void;
    onDelete: (id: number) => void;
    expandedNodes: Set<number>;
    onToggleExpanded: (id: number) => void;
    isLastChild?: boolean;
    parentConnections?: boolean[];
}

const TreeNode: React.FC<TreeNodeProps> = ({
    category,
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
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedNodes.has(category.id);

    const getStatusBadge = (isActive: boolean) => {
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isActive
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                : 'bg-secondary/10 text-secondary-foreground dark:bg-secondary/20 dark:text-secondary-foreground'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-secondary'
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
                className={`relative flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg transition-all duration-200 border border-transparent hover:border-border/50 hover:shadow-sm ${
                    isRTL ? 'flex-row-reverse' : 'flex-row'
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
                        onClick={() => onToggleExpanded(category.id)}
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



                {/* Category Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate text-foreground">
                            {category.name}
                        </span>
                        {getStatusBadge(category.isActive)}
                        {hasChildren && (
                            <Badge variant="secondary" className="text-xs h-5">
                                {category.children.length} {isRTL ? 'فرع' : 'items'}
                            </Badge>
                        )}
                    </div>
                    {/* {category.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1 leading-relaxed">
                            {category.description}
                        </p>
                    )} */}
                    {/* {category.localizations && category.localizations.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                            {category.localizations.slice(0, 3).map((loc) => (
                                <Badge key={loc.id} variant="outline" className="text-xs h-5 hover:bg-muted/50 transition-colors">
                                    {loc.languageCode}
                                </Badge>
                            ))}
                            {category.localizations.length > 3 && (
                                <Badge variant="outline" className="text-xs h-5 hover:bg-muted/50 transition-colors">
                                    +{category.localizations.length - 3}
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
                            onClick={() => onViewDetails(category)}
                        >
                            <Eye className="h-4 w-4" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} hover:bg-muted/50`}
                            onClick={() => onEdit(category)}
                        >
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} hover:bg-muted/50`}
                            onClick={() => onToggleStatus(category.id)}
                        >
                            <Power className="h-4 w-4" />
                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'} hover:bg-destructive/10`}
                            onClick={() => onDelete(category.id)}
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
                    {category.children.map((child, index) => {
                        const isLastChildItem = index === category.children.length - 1;
                        const newConnections = [...parentConnections];
                        if (level >= 0) {
                            newConnections[level] = !isLastChild;
                        }
                        
                        return (
                            <TreeNode
                                key={child.id}
                                category={child}
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

const CategoriesTree: React.FC = () => {
    const { isRTL } = useDirection();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // State for expanded nodes
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    // Query for category tree
    const { data: categoryTree, isLoading: isTreeLoading } = useQuery({
        queryKey: ['categories-tree'],
        queryFn: () => categoryService.getCategoryTree(),
    });

    // Initialize expanded nodes when tree data is loaded
    React.useEffect(() => {
        if (categoryTree && categoryTree.length > 0) {
            const allNodeIds = new Set<number>();
            const collectAllNodeIds = (categories: CategoryTreeDto[]) => {
                categories.forEach(category => {
                    allNodeIds.add(category.id);
                    if (category.children && category.children.length > 0) {
                        collectAllNodeIds(category.children);
                    }
                });
            };
            collectAllNodeIds(categoryTree);
            setExpandedNodes(allNodeIds);
        }
    }, [categoryTree]);

    // Helper functions for expand/collapse all
    const getAllNodeIds = useCallback((categories: CategoryTreeDto[]): Set<number> => {
        const nodeIds = new Set<number>();
        const collect = (cats: CategoryTreeDto[]) => {
            cats.forEach(cat => {
                nodeIds.add(cat.id);
                if (cat.children && cat.children.length > 0) {
                    collect(cat.children);
                }
            });
        };
        collect(categories);
        return nodeIds;
    }, []);

    const expandAll = useCallback(() => {
        if (categoryTree) {
            setExpandedNodes(getAllNodeIds(categoryTree));
        }
    }, [categoryTree, getAllNodeIds]);

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

    // Query for all categories to calculate stats
    const { data: allCategoriesData } = useQuery({
        queryKey: ['categories-all'],
        queryFn: () => categoryService.getCategories({ pageSize: 1000 }),
    });

    // Mutations
    const toggleMutation = useMutation({
        mutationFn: categoryService.toggleCategoryActivation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-all'] });
            queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
            toast.success(isRTL ? 'تم تحديث حالة الفئة' : 'Category status updated');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة الفئة' : 'Error updating category status'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: categoryService.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories-all'] });
            queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] });
            queryClient.invalidateQueries({ queryKey: ['categories-tree'] });
            toast.success(isRTL ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف الفئة' : 'Error deleting category'));
        },
    });

    // Handler functions
    const handleEdit = (treeCategory: CategoryTreeDto) => {
        // Navigate to categories page with edit mode
        navigate('/categories', {
            state: {
                editCategory: {
                    ...treeCategory,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            }
        });
    };

    const handleViewDetails = (treeCategory: CategoryTreeDto) => {
        // Navigate to categories page with view mode
        navigate('/categories', {
            state: {
                viewCategory: {
                    ...treeCategory,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            }
        });
    };

    // Stats calculation
    const stats = {
        total: allCategoriesData?.totalCount || 0,
        active: allCategoriesData?.items.filter(c => c.isActive).length || 0,
        inactive: allCategoriesData?.items.filter(c => !c.isActive).length || 0,
        rootCategories: categoryTree?.length || 0,
    };

    // Calculate total categories in tree (including children)
    const countTotalInTree = (categories: CategoryTreeDto[]): number => {
        return categories.reduce((total, category) => {
            return total + 1 + countTotalInTree(category.children || []);
        }, 0);
    };

    const totalInTree = categoryTree ? countTotalInTree(categoryTree) : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {isRTL ? 'عرض شجرة الفئات' : 'Categories Tree View'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isRTL
                                    ? 'عرض هرمي لجميع الفئات مع إمكانية التفاعل والتحرير'
                                    : 'Hierarchical view of all categories with interaction and editing capabilities'
                                }
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-2 justify-end'>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/categories')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {isRTL ? 'العودة للفئات' : 'Back to Categories'}
                        </Button>
                        
                        {/* Expand/Collapse Controls */}
                        <div className="flex gap-1 border rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={expandAll}
                                className="flex items-center gap-2 h-8 px-3 text-xs"
                                disabled={!categoryTree || categoryTree.length === 0}
                            >
                                <Expand className="h-3 w-3" />
                                {isRTL ? 'توسيع الكل' : 'Expand All'}
                            </Button>
                            <Button
                                variant="ghost" 
                                size="sm"
                                onClick={collapseAll}
                                className="flex items-center gap-2 h-8 px-3 text-xs"
                                disabled={!categoryTree || categoryTree.length === 0}
                            >
                                <Shrink className="h-3 w-3" />
                                {isRTL ? 'طي الكل' : 'Collapse All'}
                            </Button>
                        </div>
                        
                        <Button
                            className="gradient-primary flex items-center gap-2"
                            onClick={() => navigate('/categories')}
                        >
                            <Plus className="h-4 w-4" />
                            {isRTL ? 'إضافة فئة جديدة' : 'Add New Category'}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'إجمالي الفئات' : 'Total Categories'}
                                </p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'الفئات النشطة' : 'Active Categories'}
                                </p>
                                <p className="text-2xl font-bold text-success">{stats.active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'الفئات غير النشطة' : 'Inactive Categories'}
                                </p>
                                <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'الفئات الرئيسية' : 'Root Categories'}
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
                                {isRTL ? 'هيكل الفئات' : 'Category Structure'}
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
                                    disabled={!categoryTree || categoryTree.length === 0}
                                >
                                    <Expand className="h-3 w-3" />
                                    {isRTL ? 'توسيع الكل' : 'Expand All'}
                                </Button>
                                <Button
                                    variant="ghost" 
                                    size="sm"
                                    onClick={collapseAll}
                                    className="flex items-center gap-2 h-7 px-3 text-xs"
                                    disabled={!categoryTree || categoryTree.length === 0}
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
                        ) : !categoryTree || categoryTree.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <h3 className="text-lg font-medium mb-2">
                                    {isRTL ? 'لا توجد فئات' : 'No Categories Found'}
                                </h3>
                                <p className="text-sm text-center mb-4">
                                    {isRTL
                                        ? 'لم يتم العثور على أي فئات لعرضها في الشجرة'
                                        : 'No categories found to display in the tree view'
                                    }
                                </p>
                                <Button
                                    className="gradient-primary"
                                    onClick={() => navigate('/categories')}
                                >
                                    {isRTL ? 'إضافة فئة جديدة' : 'Add First Category'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-1 bg-gradient-to-br from-muted/20 to-muted/5 p-4 rounded-xl border border-border/50">
                                {categoryTree.map((category, index) => (
                                    <TreeNode
                                        key={category.id}
                                        category={category}
                                        level={0}
                                        isRTL={isRTL}
                                        onEdit={handleEdit}
                                        onViewDetails={handleViewDetails}
                                        onToggleStatus={(id) => toggleMutation.mutate(id)}
                                        onDelete={(id) => deleteMutation.mutate(id)}
                                        expandedNodes={expandedNodes}
                                        onToggleExpanded={toggleNodeExpanded}
                                        isLastChild={index === categoryTree.length - 1}
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

export default CategoriesTree;
