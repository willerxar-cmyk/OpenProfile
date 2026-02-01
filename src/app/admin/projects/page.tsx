'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CategoryModal } from '@/components/CategoryModal';
import portfolioCategoriesData from '@/data/portfolio-categories.json';

export default function AdminProjectsPage() {
  const { projects, isLoading, deleteProject, updateProject } = useProjects();
  const { t } = useI18n();
  const [categories, setCategories] = useState(portfolioCategoriesData.categories);

  const handleTogglePublished = (id: string, current: boolean) => {
    updateProject(id, { published: !current });
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    updateProject(id, { featured: !current });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.projects')}</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio projects</p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryModal 
            type="portfolio" 
            categories={categories} 
            onCategoriesChange={setCategories} 
          />
          <Link href="/admin/projects/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('admin.addNew')}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Link href="/admin/projects/new">
                <Button variant="outline">Create your first project</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project, index) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {project.featured && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                          {project.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {project.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleTogglePublished(project.id, project.published)}
                          >
                            {project.published ? (
                              <Eye className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleFeatured(project.id, project.featured)}
                          >
                            <Star className={`w-4 h-4 ${project.featured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}