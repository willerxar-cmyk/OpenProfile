'use client';

import { useState } from 'react';
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
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useBlog } from '@/hooks/useBlog';
import { CategoryModal } from '@/components/CategoryModal';
import blogCategoriesData from '@/data/blog-categories.json';
import { format } from 'date-fns';

export default function AdminBlogPage() {
  const { posts, isLoading, deletePost, updatePost } = useBlog();
  const [categories, setCategories] = useState(blogCategoriesData.categories);

  const handleTogglePublished = async (id: string, current: boolean) => {
    await updatePost(id, { published: !current, status: !current ? 'published' : 'draft' });
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await updatePost(id, { featured: !current });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus posts</p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryModal 
            type="blog" 
            categories={categories} 
            onCategoriesChange={setCategories} 
          />
          <Link href="/admin/blog/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Post
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum post criado ainda</p>
              <Link href="/admin/blog/new">
                <Button variant="outline">Criar primeiro post</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {post.featured && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {post.translations.en.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">/{post.slug}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {post.category || 'geral'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.tags.length - 3}
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
                            onClick={() => handleTogglePublished(post.id, post.published)}
                          >
                            {post.published ? (
                              <Eye className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleFeatured(post.id, post.featured)}
                          >
                            <Star className={`w-4 h-4 ${post.featured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                          </Button>
                          {post.published ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                              Publicado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Rascunho</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/admin/blog/edit/${post.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deletePost(post.id)}
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
