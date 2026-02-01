'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBlog } from '@/hooks/useBlog';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Archive,
  X,
  Plus,
  Loader2,
  Globe,
  Search,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { BlogPost, Locale, PostStatus } from '@/types';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const LOCALES: Locale[] = ['pt', 'en', 'es'];

const CATEGORIES = [
  { id: 'development', label: 'Development' },
  { id: 'design', label: 'Design' },
  { id: 'three-d', label: '3D & Animation' },
  { id: 'creative', label: 'Creative Arts' },
];

const SUBCATEGORIES: Record<string, { id: string; label: string }[]> = {
  development: [
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'mobile', label: 'Mobile' },
  ],
  design: [
    { id: 'ui-ux', label: 'UI/UX' },
    { id: 'branding', label: 'Branding' },
    { id: 'illustration', label: 'Illustration' },
    { id: 'motion', label: 'Motion' },
  ],
  'three-d': [
    { id: 'modeling', label: 'Modeling' },
    { id: 'animation', label: 'Animation' },
    { id: 'rendering', label: 'Rendering' },
    { id: 'vfx', label: 'VFX' },
  ],
  creative: [
    { id: 'photography', label: 'Photography' },
    { id: 'video', label: 'Video' },
    { id: 'music', label: 'Music' },
  ],
};

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const { t, locale } = useI18n();
  const { posts, updatePost, deletePost, publishPost, archivePost, authors, tags, isLoading } = useBlog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);
  const [newTag, setNewTag] = useState('');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  const postId = params.id as string;

  useEffect(() => {
    const found = posts.find(p => p.id === postId);
    if (found) {
      setPost(found);
    }
  }, [posts, postId]);

  // Autosave functionality
  useEffect(() => {
    if (!post) return;

    const timer = setTimeout(async () => {
      setAutosaveStatus('saving');
      try {
        await updatePost(postId, post);
        setAutosaveStatus('saved');
        setTimeout(() => setAutosaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Autosave failed:', error);
        setAutosaveStatus('idle');
      }
    }, 30000); // Autosave every 30 seconds

    return () => clearTimeout(timer);
  }, [post, postId, updatePost]);

  const updateField = <K extends keyof BlogPost>(field: K, value: BlogPost[K]) => {
    if (!post) return;
    setPost(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateTranslation = (locale: Locale, field: 'title' | 'excerpt' | 'content', value: string) => {
    if (!post) return;
    setPost(prev => prev ? {
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    } : null);
  };

  const updateMeta = (locale: Locale, field: 'metaTitle' | 'metaDescription', value: string) => {
    if (!post) return;
    setPost(prev => prev ? {
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    } : null);
  };

  const handleAddTag = () => {
    if (!post || !newTag || post.tags.includes(newTag)) return;
    updateField('tags', [...post.tags, newTag]);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!post) return;
    updateField('tags', post.tags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!post) return;
    setIsSubmitting(true);
    
    try {
      await updatePost(postId, post);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!post) return;
    setIsSubmitting(true);
    
    try {
      await publishPost(postId);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!post) return;
    setIsSubmitting(true);
    
    try {
      await archivePost(postId);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to archive post:', error);
      alert('Failed to archive post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      await deletePost(postId);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">Post not found</p>
        <Link href="/admin/blog" className="mt-4">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('blog.editPost') || 'Editar Post'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                {t('blog.lastUpdated') || 'Última atualização'}: {new Date(post.updatedAt).toLocaleString()}
              </p>
              {autosaveStatus === 'saving' && (
                <span className="text-xs text-blue-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('blog.saving') || 'Salvando...'}
                </span>
              )}
              {autosaveStatus === 'saved' && (
                <span className="text-xs text-green-500">{t('blog.saved') || 'Salvo'}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('blog.delete') || 'Excluir'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  {t('blog.confirmDelete') || 'Confirmar exclusão'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('blog.deleteWarning') || 'Esta ação não pode ser desfeita.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel') || 'Cancelar'}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  {t('blog.delete') || 'Excluir'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {post.status === 'draft' && (
            <Button onClick={handlePublish} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              <span>{t('blog.publish') || 'Publicar'}</span>
            </Button>
          )}

          {post.status === 'published' && (
            <Button variant="outline" onClick={handleArchive} disabled={isSubmitting} className="gap-2">
              <Archive className="w-4 h-4" />
              <span>{t('blog.archive') || 'Arquivar'}</span>
            </Button>
          )}

          <Button onClick={handleSave} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{t('blog.save') || 'Salvar'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('blog.content') || 'Conteúdo'}
              </CardTitle>
              <CardDescription>
                {t('blog.contentDescription') || 'Edite o conteúdo do post em diferentes idiomas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)}>
                <TabsList className="mb-4">
                  {LOCALES.map((loc) => (
                    <TabsTrigger key={loc} value={loc} className="uppercase">
                      {loc}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {LOCALES.map((loc) => (
                  <TabsContent key={loc} value={loc} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`title-${loc}`}>
                            {t('blog.title') || 'Título'} *
                          </Label>
                          <Input
                            id={`title-${loc}`}
                            value={post.translations[loc].title}
                            onChange={(e) => updateTranslation(loc, 'title', e.target.value)}
                            placeholder={t('blog.titlePlaceholder') || 'Digite o título do post'}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`excerpt-${loc}`}>
                            {t('blog.excerpt') || 'Resumo'}
                          </Label>
                          <Textarea
                            id={`excerpt-${loc}`}
                            value={post.translations[loc].excerpt}
                            onChange={(e) => updateTranslation(loc, 'excerpt', e.target.value)}
                            placeholder={t('blog.excerptPlaceholder') || 'Breve descrição do post'}
                            rows={3}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>
                            {t('blog.content') || 'Conteúdo'} *
                          </Label>
                          <div className="mt-1">
                            <RichTextEditor
                              content={post.translations[loc].content}
                              onChange={(content) => updateTranslation(loc, 'content', content)}
                              placeholder={t('blog.contentPlaceholder') || 'Comece a escrever o conteúdo...'}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {t('blog.seo') || 'SEO'}
              </CardTitle>
              <CardDescription>
                {t('blog.seoDescription') || 'Otimize para motores de busca'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)}>
                <TabsList className="mb-4">
                  {LOCALES.map((loc) => (
                    <TabsTrigger key={loc} value={loc} className="uppercase">
                      {loc}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {LOCALES.map((loc) => (
                  <TabsContent key={loc} value={loc} className="space-y-4">
                    <div>
                      <Label htmlFor={`metaTitle-${loc}`}>
                        {t('blog.metaTitle') || 'Meta Título'}
                      </Label>
                      <Input
                        id={`metaTitle-${loc}`}
                        value={String(post.metaTitle?.[loc] || '')}
                        onChange={(e) => updateMeta(loc, 'metaTitle', e.target.value)}
                        placeholder={t('blog.metaTitlePlaceholder') || 'Título para SEO'}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {String(post.metaTitle?.[loc] || '').length}/60 caracteres
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`metaDescription-${loc}`}>
                        {t('blog.metaDescription') || 'Meta Descrição'}
                      </Label>
                      <Textarea
                        id={`metaDescription-${loc}`}
                        value={String(post.metaDescription?.[loc] || '')}
                        onChange={(e) => updateMeta(loc, 'metaDescription', e.target.value)}
                        placeholder={t('blog.metaDescriptionPlaceholder') || 'Descrição para SEO'}
                        rows={2}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {String(post.metaDescription?.[loc] || '').length}/160 caracteres
                      </p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('blog.settings') || 'Configurações'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">{t('blog.status') || 'Status'}</Label>
                <Select
                  value={post.status}
                  onValueChange={(value) => updateField('status', value as PostStatus)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('blog.draft') || 'Rascunho'}</SelectItem>
                    <SelectItem value="published">{t('blog.published') || 'Publicado'}</SelectItem>
                    <SelectItem value="archived">{t('blog.archived') || 'Arquivado'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="slug">{t('blog.slug') || 'Slug'}</Label>
                <Input
                  id="slug"
                  value={post.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="url-amigavel"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t('blog.category') || 'Categoria'}</Label>
                <Select
                  value={post.category}
                  onValueChange={(value) => {
                    updateField('category', value);
                    updateField('subcategory', SUBCATEGORIES[value][0].id);
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('blog.subcategory') || 'Subcategoria'}</Label>
                <Select
                  value={post.subcategory}
                  onValueChange={(value) => updateField('subcategory', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBCATEGORIES[post.category]?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('blog.author') || 'Autor'}</Label>
                <Select
                  value={post.authorId}
                  onValueChange={(value) => updateField('authorId', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="cursor-pointer">
                  {t('blog.featured') || 'Destaque'}
                </Label>
                <Switch
                  id="featured"
                  checked={post.featured}
                  onCheckedChange={(checked) => updateField('featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>{t('blog.coverImage') || 'Imagem de Capa'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={post.imageUrl}
                onChange={(url) => updateField('imageUrl', url || undefined)}
                folder="blog"
                aspectRatio="video"
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>{t('blog.tags') || 'Tags'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={t('blog.addTag') || 'Adicionar tag'}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" size="icon" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
