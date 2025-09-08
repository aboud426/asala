import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Languages,
  ChevronLeft,
  ChevronRight,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  MapPin,
  SkipForward,
  Save,
  X,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import regionService, {
  Region,
  UpdateRegionDto,
  UpdateLocalizedRegionDto,
} from '@/services/regionService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';

interface MissingRegionTranslationsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  missingRegionIds: number[];
}

export const MissingRegionTranslationsModal: React.FC<MissingRegionTranslationsModalProps> = ({
  isOpen,
  onOpenChange,
  missingRegionIds,
}) => {
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedRegions, setProcessedRegions] = useState<Set<number>>(new Set());

  const currentRegionId = missingRegionIds[currentIndex];
  const totalRegions = missingRegionIds.length;
  const progress = Math.round(((currentIndex + 1) / totalRegions) * 100);

  // Form setup
  const form = useForm<UpdateRegionDto>({
    defaultValues: {
      name: '',
      parentId: undefined,
      isActive: true,
      localizations: [],
    },
  });

  const {
    fields: localizations,
    append: appendLocalization,
    remove: removeLocalization,
    replace: replaceLocalizations,
  } = useFieldArray({
    control: form.control,
    name: 'localizations',
  });

  // Queries
  const { data: currentRegion, isLoading: isRegionLoading } = useQuery({
    queryKey: ['region', currentRegionId],
    queryFn: async () => {
      const regions = await regionService.getRegions({ pageSize: 1000 });
      return regions.items.find(r => r.id === currentRegionId);
    },
    enabled: !!currentRegionId && isOpen,
  });

  const { data: languages } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
    enabled: isOpen,
  });

  // Mutation for updating region
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRegionDto }) =>
      regionService.updateRegion(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regions-all'] });
      queryClient.invalidateQueries({ queryKey: ['regions-missing-translations'] });
      
      setProcessedRegions(prev => new Set([...prev, currentRegionId]));
      toast.success(
        isRTL 
          ? 'تم حفظ الترجمات بنجاح' 
          : 'Translations saved successfully'
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 
        (isRTL ? 'حدث خطأ أثناء حفظ الترجمات' : 'Error saving translations')
      );
    },
  });

  // Reset form when region changes
  useEffect(() => {
    if (currentRegion) {
      form.reset({
        name: currentRegion.name,
        parentId: currentRegion.parentId,
        isActive: currentRegion.isActive,
        localizations: currentRegion.localizations?.map(loc => ({
          id: loc.id,
          localizedName: loc.localizedName,
          languageId: loc.languageId,
          isActive: loc.isActive,
        })) || [],
      });
      replaceLocalizations(currentRegion.localizations?.map(loc => ({
        id: loc.id,
        localizedName: loc.localizedName,
        languageId: loc.languageId,
        isActive: loc.isActive,
      })) || []);
    }
  }, [currentRegion, form, replaceLocalizations]);

  // Navigation functions
  const goToNext = () => {
    if (currentIndex < totalRegions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const skipCurrent = () => {
    setProcessedRegions(prev => new Set([...prev, currentRegionId]));
    if (currentIndex < totalRegions - 1) {
      goToNext();
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentIndex(0);
    setProcessedRegions(new Set());
    onOpenChange(false);
    form.reset();
  };

  // Form submission
  const onSubmit = async (data: UpdateRegionDto) => {
    if (!currentRegionId) return;

    updateMutation.mutate({ id: currentRegionId, data }, {
      onSuccess: () => {
        if (currentIndex < totalRegions - 1) {
          goToNext();
        } else {
          // All regions processed
          toast.success(
            isRTL 
              ? 'تم الانتهاء من جميع الترجمات!' 
              : 'All translations completed!'
          );
          handleClose();
        }
      },
    });
  };

  const addNewLocalization = () => {
    appendLocalization({
      localizedName: '',
      languageId: 0,
      isActive: true,
    });
  };

  // Get available languages (excluding already added ones)
  const getAvailableLanguages = (currentLanguageId?: number) => {
    if (!languages) return [];
    
    const usedLanguageIds = localizations
      .map(loc => loc.languageId)
      .filter(id => id !== currentLanguageId);
    
    return languages.filter(lang => !usedLanguageIds.includes(lang.id));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[95vh] sm:h-[90vh] max-h-none overflow-hidden flex flex-col p-0">
        <DialogHeader className="space-y-3 p-4 sm:p-6 pb-3 sm:pb-4 border-b flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2 sm:gap-3 order-1 sm:order-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-base sm:text-xl font-semibold leading-tight">
                {isRTL ? 'إضافة ترجمات المناطق المفقودة' : 'Add Missing Region Translations'}
              </span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground order-2 sm:order-2 self-start sm:self-center h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 text-sm">
              <span className="text-muted-foreground text-xs sm:text-sm">
                {isRTL 
                  ? `المنطقة ${currentIndex + 1} من ${totalRegions}`
                  : `Region ${currentIndex + 1} of ${totalRegions}`
                }
              </span>
              <Badge variant="outline" className="text-xs self-start xs:self-center">
                {progress}% {isRTL ? 'مكتمل' : 'Complete'}
              </Badge>
            </div>
            <Progress value={progress} className="h-1.5 sm:h-2" />
            
            {/* Current Region Info */}
            {currentRegion && (
              <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs sm:text-sm truncate">{currentRegion.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mt-0.5">
                        {currentRegion.parentName ? `${isRTL ? 'تابع لـ' : 'Under'} ${currentRegion.parentName}` : (isRTL ? 'منطقة رئيسية' : 'Root region')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      <span className="hidden xs:inline">
                        {currentRegion.localizations?.length || 0} {isRTL ? 'ترجمة' : 'translations'}
                      </span>
                      <span className="xs:hidden">
                        {currentRegion.localizations?.length || 0}
                      </span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogDescription className="flex items-start gap-2 text-xs sm:text-sm">
            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {isRTL 
                ? 'أضف ترجمات المناطق للغات مختلفة لتحسين تجربة المستخدم متعدد اللغات'
                : 'Add region translations in different languages to improve multilingual user experience'
              }
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 sm:py-4">
          {isRegionLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground text-sm">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Localizations */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                    <h4 className="text-base sm:text-lg font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      {isRTL ? 'الترجمات' : 'Translations'}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewLocalization}
                      className="gradient-border self-start xs:self-center h-8 sm:h-9 px-3 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="ml-1 sm:ml-2">
                        {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                      </span>
                    </Button>
                  </div>

                  {localizations.length === 0 && (
                    <Card className="border-dashed border-2 border-muted-foreground/20">
                      <CardContent className="py-8 sm:py-12 text-center px-4 sm:px-6">
                        <Globe className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
                        <h4 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                          {isRTL ? 'لا توجد ترجمات' : 'No Translations'}
                        </h4>
                        <p className="text-muted-foreground text-xs sm:text-sm mb-4 leading-relaxed">
                          {isRTL 
                            ? 'أضف ترجمات للمنطقة هذه لتحسين تجربة المستخدم'
                            : 'Add translations for this region to improve user experience'
                          }
                        </p>
                        <Button
                          type="button"
                          onClick={addNewLocalization}
                          className="gradient-primary h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {isRTL ? 'إضافة أول ترجمة' : 'Add First Translation'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {localizations.map((field, index) => (
                    <Card key={field.id} className="border shadow-sm">
                      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-xs sm:text-sm flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Languages className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                            </div>
                            <span className="truncate">
                              {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                            </span>
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLocalization(index)}
                            className="text-destructive hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                          <FormField
                            control={form.control}
                            name={`localizations.${index}.languageId`}
                            rules={{ 
                              required: isRTL ? 'اللغة مطلوبة' : 'Language is required',
                              validate: (value) => {
                                if (value === 0) {
                                  return isRTL ? 'يرجى اختيار لغة' : 'Please select a language';
                                }
                                return true;
                              }
                            }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sm:text-sm">{isRTL ? 'اللغة' : 'Language'}</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  value={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                                      <SelectValue placeholder={isRTL ? 'اختر اللغة' : 'Select Language'} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {getAvailableLanguages(field.value).map((lang) => (
                                      <SelectItem key={lang.id} value={lang.id.toString()}>
                                        <div className="flex items-center gap-2">
                                          <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span className="text-xs sm:text-sm">
                                            {lang.name} ({lang.code})
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`localizations.${index}.localizedName`}
                            rules={{ required: isRTL ? 'الاسم المترجم مطلوب' : 'Translated name is required' }}
                            render={({ field }) => (
                              <FormItem className="lg:col-span-1">
                                <FormLabel className="text-xs sm:text-sm">{isRTL ? 'الاسم المترجم' : 'Translated Name'}</FormLabel>
                                <FormControl>
                                  <Input
                                    className="h-8 sm:h-9 text-xs sm:text-sm"
                                    placeholder={isRTL ? 'اسم المنطقة بهذه اللغة' : 'Region name in this language'}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`localizations.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 sm:p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-xs sm:text-sm">
                                  {isRTL ? 'الترجمة نشطة' : 'Translation Active'}
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </form>
            </Form>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="pt-3 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6 border-t space-y-3 sm:space-y-0 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
            {/* Navigation */}
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                {isRTL ? <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="ml-1 sm:ml-2">
                  {isRTL ? 'السابق' : 'Previous'}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex >= totalRegions - 1}
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <span className="mr-1 sm:mr-2">
                  {isRTL ? 'التالي' : 'Next'}
                </span>
                {isRTL ? <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={skipCurrent}
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:ml-2">
                  {isRTL ? 'تخطي' : 'Skip'}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm hidden xs:inline-flex"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="submit"
                className="gradient-primary h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium"
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateMutation.isPending || isRegionLoading}
              >
                {updateMutation.isPending ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2" />
                ) : (
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden xs:inline">
                  {isRTL ? 'حفظ وتابع' : 'Save & Continue'}
                </span>
                <span className="xs:hidden">
                  {isRTL ? 'حفظ' : 'Save'}
                </span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissingRegionTranslationsModal;
