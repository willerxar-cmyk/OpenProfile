'use client';

import { useBlog } from '@/hooks/useBlog';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Search, FileText } from 'lucide-react';
import { useState } from 'react';

export default function AdminBlogPage() {
  const { posts, isLoading, deletePost, updatePost } = useBlog();
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.translations[locale].title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.translations[locale].excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'published') return matchesSearch && post.published;
    if (activeTab === 'drafts') return matchesSearch && !post.published;
    if (activeTab === 'featured') return matchesSearch && post.featured;
    return matchesSearch;
  });

  const handleTogglePublished = (id: string, current: boolean) => {
    updatePost(id, { published: !current });
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    updatePost(id, { featured: !current });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground mt-1">
            Manage your blog posts and content
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No posts found</p>
              <Link href="/admin/blog/new">
                <Button>Create your first post</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.featured && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        <h3 className="text-lg font-semibold">
                          {post.translations[locale].title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {post.translations[locale].excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <Badge variant="outline" className="capitalize">
                          {post.category}
                        </Badge>
                        <div className="flex gap-1">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
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
                      <Link href={`/admin/blog/edit/${post.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
