'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  X,
  Plus,
  Loader2,
  Globe,
  Search,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { BlogPost, Locale, PostStatus } from '@/types';
import { motion } from 'framer-motion';

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

interface FormData {
  slug: string;
  status: PostStatus;
  featured: boolean;
  category: string;
  subcategory: string;
  authorId: string;
  imageUrl: string;
  tags: string[];
  translations: Record<Locale, {
    title: string;
    excerpt: string;
    content: string;
  }>;
  metaTitle: Record<Locale, string>;
  metaDescription: Record<Locale, string>;
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { addPost, tags, authors, createSlug } = useBlog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<FormData>({
    slug: '',
    status: 'draft',
    featured: false,
    category: 'development',
    subcategory: 'frontend',
    authorId: 'author-1',
    imageUrl: '',
    tags: [],
    translations: {
      pt: { title: '', excerpt: '', content: '' },
      en: { title: '', excerpt: '', content: '' },
      es: { title: '', excerpt: '', content: '' },
    },
    metaTitle: { pt: '', en: '', es: '' },
    metaDescription: { pt: '', en: '', es: '' },
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTranslation = (locale: Locale, field: 'title' | 'excerpt' | 'content', value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    }));
  };

  const updateMeta = (locale: Locale, field: 'metaTitle' | 'metaDescription', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      updateField('tags', [...formData.tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag));
  };

  const handleTitleChange = (locale: Locale, title: string) => {
    updateTranslation(locale, 'title', title);
    
    // Auto-generate slug from default locale title
    if (locale === 'en' && !formData.slug) {
      updateField('slug', createSlug(title));
    }
  };

  const handleSubmit = async (publish = false) => {
    setIsSubmitting(true);
    
    try {
      const postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: formData.slug || createSlug(formData.translations.en.title),
        status: publish ? 'published' : formData.status,
        published: publish,
        featured: formData.featured,
        category: formData.category,
        subcategory: formData.subcategory,
        authorId: formData.authorId,
        imageUrl: formData.imageUrl,
        tags: formData.tags,
        translations: formData.translations,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      };

      await addPost(postData);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold">{t('blog.newPost') || 'Novo Post'}</h1>
            <p className="text-muted-foreground mt-1">
              {t('blog.createPost') || 'Crie um novo post para o blog'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ml-2">{t('blog.saveDraft') || 'Salvar Rascunho'}</span>
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            <span>{t('blog.publish') || 'Publicar'}</span>
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
                {t('blog.contentDescription') || 'Escreva o conteúdo do post em diferentes idiomas'}
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
                            value={formData.translations[loc].title}
                            onChange={(e) => handleTitleChange(loc, e.target.value)}
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
                            value={formData.translations[loc].excerpt}
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
                              content={formData.translations[loc].content}
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
                        value={formData.metaTitle[loc]}
                        onChange={(e) => updateMeta(loc, 'metaTitle', e.target.value)}
                        placeholder={t('blog.metaTitlePlaceholder') || 'Título para SEO'}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.metaTitle[loc].length}/60 caracteres
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`metaDescription-${loc}`}>
                        {t('blog.metaDescription') || 'Meta Descrição'}
                      </Label>
                      <Textarea
                        id={`metaDescription-${loc}`}
                        value={formData.metaDescription[loc]}
                        onChange={(e) => updateMeta(loc, 'metaDescription', e.target.value)}
                        placeholder={t('blog.metaDescriptionPlaceholder') || 'Descrição para SEO'}
                        rows={2}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.metaDescription[loc].length}/160 caracteres
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
                <Label htmlFor="slug">{t('blog.slug') || 'Slug'}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="url-amigavel"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t('blog.category') || 'Categoria'}</Label>
                <Select
                  value={formData.category}
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
                  value={formData.subcategory}
                  onValueChange={(value) => updateField('subcategory', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBCATEGORIES[formData.category]?.map((sub) => (
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
                  value={formData.authorId}
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
                  checked={formData.featured}
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
                value={formData.imageUrl}
                onChange={(url) => updateField('imageUrl', url || '')}
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
                {formData.tags.map((tag) => (
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
