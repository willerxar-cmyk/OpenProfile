'use client';

import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useState } from 'react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Plus, Trash2, Edit2, Download, Upload, RotateCcw } from 'lucide-react';

export default function CategoriesAdminPage() {
  const { 
    categories, 
    isLoading, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    resetToDefault,
    exportCategories,
    importCategories,
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form states
  const [newCategory, setNewCategory] = useState({
    key: '',
    icon: 'Folder',
    color: '#3B82F6',
  });

  const [newSubcategory, setNewSubcategory] = useState({
    key: '',
    icon: 'File',
  });

  const handleAddCategory = () => {
    if (newCategory.key) {
      addCategory({
        ...newCategory,
        subcategories: [],
      });
      setNewCategory({ key: '', icon: 'Folder', color: '#3B82F6' });
      setIsAddCategoryOpen(false);
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.key && selectedCategoryId) {
      addSubcategory(selectedCategoryId, newSubcategory);
      setNewSubcategory({ key: '', icon: 'File' });
      setIsAddSubcategoryOpen(false);
    }
  };

  const handleExport = () => {
    const data = exportCategories();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const success = importCategories(importText);
    if (success) {
      setImportText('');
      setIsImportOpen(false);
    } else {
      alert('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage your portfolio categories and subcategories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={resetToDefault}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={() => setIsAddCategoryOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category, index) => {
              const IconComponent = (Icons[category.icon as keyof typeof Icons] as LucideIcon) || Icons.Folder;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.key}</CardTitle>
                            <CardDescription className="text-xs">
                              ID: {category.id}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Subcategories</span>
                          <Badge variant="secondary">{category.subcategories.length}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.subcategories.map((sub) => {
                            const SubIcon = (Icons[sub.icon as keyof typeof Icons] as LucideIcon) || Icons.File;
                            return (
                              <div 
                                key={sub.id}
                                className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
                              >
                                <SubIcon className="w-3 h-3" />
                                <span>{sub.key}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 ml-1 hover:text-red-500"
                                  onClick={() => deleteSubcategory(category.id, sub.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setIsAddSubcategoryOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Subcategory
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {(Icons[category.icon as keyof typeof Icons] as LucideIcon) && 
                          <>{(() => {
                            const IconComponent = Icons[category.icon as keyof typeof Icons] as LucideIcon;
                            return <IconComponent className="w-4 h-4" style={{ color: category.color }} />;
                          })()}</>
                        }
                      </div>
                      <div>
                        <p className="font-medium">{category.key}</p>
                        <p className="text-xs text-muted-foreground">ID: {category.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">
                        {category.subcategories.length} subcategories
                      </Badge>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for your portfolio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Translation Key</Label>
              <Input 
                placeholder="categories.newCategory"
                value={newCategory.key}
                onChange={(e) => setNewCategory({...newCategory, key: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                This key will be used to look up the translated name
              </p>
            </div>
            <div className="space-y-2">
              <Label>Icon Name</Label>
              <Input 
                placeholder="Folder"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  className="w-20"
                />
                <Input 
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubcategoryOpen} onOpenChange={setIsAddSubcategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Translation Key</Label>
              <Input 
                placeholder="subcategories.newSubcategory"
                value={newSubcategory.key}
                onChange={(e) => setNewSubcategory({...newSubcategory, key: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon Name</Label>
              <Input 
                placeholder="File"
                value={newSubcategory.icon}
                onChange={(e) => setNewSubcategory({...newSubcategory, icon: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubcategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Categories</DialogTitle>
            <DialogDescription>
              Paste your JSON categories data below
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full h-64 p-4 font-mono text-sm border rounded-md"
              placeholder="Paste JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
