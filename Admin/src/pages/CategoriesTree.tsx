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
    Folder,
    Globe,
    TreePine,
    Edit,
    Eye,
    Power,
    Trash2,
    MoreHorizontal,
    FolderTree,
    Plus,
    ArrowLeft,
    CheckCircle,
    XCircle,
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
}

const TreeNode: React.FC<TreeNodeProps> = ({
    category,
    level,
    isRTL,
    onEdit,
    onViewDetails,
    onToggleStatus,
    onDelete
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;

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

                {/* Category Icon */}
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Folder className="h-4 w-4 text-primary-foreground" />
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{category.name}</span>
                        {getStatusBadge(category.isActive)}
                    </div>
                    {category.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                            {category.description}
                        </p>
                    )}
                    {category.localizations && category.localizations.length > 0 && (
                        <div className="flex gap-1 mt-1">
                            {category.localizations.slice(0, 3).map((loc) => (
                                <Badge key={loc.id} variant="outline" className="text-xs h-5">
                                    <Globe className="h-3 w-3 mr-1" />
                                    {loc.languageCode}
                                </Badge>
                            ))}
                            {category.localizations.length > 3 && (
                                <Badge variant="outline" className="text-xs h-5">
                                    +{category.localizations.length - 3}
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
                            onClick={() => onViewDetails(category)}
                        >
                            <Eye className="h-4 w-4" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => onEdit(category)}
                        >
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => onToggleStatus(category.id)}
                        >
                            <Power className="h-4 w-4" />
                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
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
                <div className={isRTL ? 'mr-4' : 'ml-4'}>
                    {category.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            category={child}
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

const CategoriesTree: React.FC = () => {
    const { isRTL } = useDirection();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Query for category tree
    const { data: categoryTree, isLoading: isTreeLoading } = useQuery({
        queryKey: ['categories-tree'],
        queryFn: () => categoryService.getCategoryTree(),
    });

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
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                                    <TreePine className="h-5 w-5 text-primary-foreground" />
                                </div>
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
                    <div className='flex gap-2 justify-evenly'>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/categories')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {isRTL ? 'العودة للفئات' : 'Back to Categories'}
                        </Button>
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'إجمالي الفئات' : 'Total Categories'}
                                    </p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <FolderTree className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'الفئات النشطة' : 'Active Categories'}
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
                                        {isRTL ? 'الفئات غير النشطة' : 'Inactive Categories'}
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
                                        {isRTL ? 'الفئات الرئيسية' : 'Root Categories'}
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.rootCategories}</p>
                                </div>
                                <TreePine className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tree View Content */}
                <Card className="border-0 shadow-elegant">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-primary" />
                            {isRTL ? 'هيكل الفئات' : 'Category Structure'}
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
                        ) : !categoryTree || categoryTree.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <TreePine className="h-16 w-16 mb-4 opacity-50" />
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
                                    <Plus className="h-4 w-4 mr-2" />
                                    {isRTL ? 'إضافة فئة جديدة' : 'Add First Category'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categoryTree.map((category) => (
                                    <TreeNode
                                        key={category.id}
                                        category={category}
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

export default CategoriesTree;
