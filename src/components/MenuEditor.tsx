'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  isExternal?: boolean;
}

const defaultMenuItems: MenuItem[] = [
  { id: '1', label: 'Home', href: '/' },
  { id: '2', label: 'Portfolio', href: '/portfolio' },
  { id: '3', label: 'Blog', href: '/blog' },
  { id: '4', label: 'About', href: '/about' },
];

export function MenuEditor() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);

  useEffect(() => {
    const saved = localStorage.getItem('portfolio_menu');
    if (saved) {
      try {
        setMenuItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse menu:', e);
      }
    }
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMenuItems(items);
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: 'New Item',
      href: '/',
    };
    setMenuItems([...menuItems, newItem]);
  };

  const updateMenuItem = (id: string, field: keyof MenuItem, value: string | boolean) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const saveMenu = () => {
    localStorage.setItem('portfolio_menu', JSON.stringify(menuItems));
    toast.success('Menu salvo com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Itens do Menu</h3>
          <p className="text-sm text-muted-foreground">
            Arraste para reordenar. Clique para editar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addMenuItem} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
          <Button onClick={saveMenu} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Salvar Menu
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="menu-items">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {menuItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-4 p-4 border rounded-lg bg-card ${
                        snapshot.isDragging ? 'shadow-lg border-primary' : ''
                      }`}
                    >
                      <div {...provided.dragHandleProps} className="cursor-move">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={item.label}
                            onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                            placeholder="Nome do item"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">URL</Label>
                          <Input
                            value={item.href}
                            onChange={(e) => updateMenuItem(item.id, 'href', e.target.value)}
                            placeholder="/caminho"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ícone (opcional)</Label>
                          <Input
                            value={item.icon || ''}
                            onChange={(e) => updateMenuItem(item.id, 'icon', e.target.value)}
                            placeholder="Nome do ícone"
                          />
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMenuItem(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {menuItems.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Nenhum item no menu</p>
          <Button onClick={addMenuItem} variant="outline">
            Adicionar primeiro item
          </Button>
        </div>
      )}

      {/* Preview */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-3">Preview do Menu</h4>
        <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
          {menuItems.map((item) => (
            <Badge key={item.id} variant="outline" className="gap-1">
              {item.label}
              {item.isExternal && <ExternalLink className="h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
