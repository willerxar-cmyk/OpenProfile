'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Tags } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  label: string;
  color: string;
  description: string;
}

interface CategoryModalProps {
  type: 'blog' | 'portfolio';
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

export function CategoryModal({ type, categories, onCategoriesChange }: CategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: '', color: '#3B82F6', description: '' });

  const title = type === 'blog' ? 'Categorias do Blog' : 'Categorias do Portfólio';

  const addCategory = () => {
    if (!newCategory.label) {
      toast.error('Digite um nome para a categoria');
      return;
    }

    const category: Category = {
      id: newCategory.label.toLowerCase().replace(/\s+/g, '-'),
      label: newCategory.label,
      color: newCategory.color,
      description: newCategory.description,
    };

    onCategoriesChange([...categories, category]);
    setNewCategory({ label: '', color: '#3B82F6', description: '' });
    toast.success('Categoria adicionada!');
  };

  const removeCategory = (id: string) => {
    onCategoriesChange(categories.filter(c => c.id !== id));
    toast.success('Categoria removida!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tags className="h-4 w-4" />
          Categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Add New Category */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium">Adicionar Nova Categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Tutoriais"
                  value={newCategory.label}
                  onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-16"
                  />
                  <Input
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Breve descrição da categoria"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            <Button onClick={addCategory} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Categoria
            </Button>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            <h3 className="font-medium">Categorias Existentes</h3>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma categoria criada ainda
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <Badge 
                          style={{ 
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            borderColor: category.color,
                          }}
                          variant="outline"
                        >
                          {category.label}
                        </Badge>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => removeCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
