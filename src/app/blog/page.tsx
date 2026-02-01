'use client';

import { useBlog } from '@/hooks/useBlog';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Calendar, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { BlogPost, Locale } from '@/types';

export default function BlogPage() {
  const { posts, isLoading, getFeaturedPosts } = useBlog();
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const publishedPosts = posts.filter(p => p.published);
  const featuredPosts = getFeaturedPosts();
  
  const filteredPosts = searchQuery 
    ? publishedPosts.filter(post => 
        post.translations[locale].title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.translations[locale].excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : publishedPosts;

  return (
    <div className="container py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          Blog
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground"
        >
          Insights, tutorials, and thoughts on design, development, and creativity
        </motion.p>
        
        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-md mx-auto pt-4"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground mt-2" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </motion.div>
      </div>

      {/* Featured Posts */}
      {!searchQuery && featuredPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.slice(0, 2).map((post, index) => (
              <FeaturedPostCard key={post.id} post={post} locale={locale} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          {searchQuery ? 'Search Results' : 'All Posts'}
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} locale={locale} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FeaturedPostCard({ post, locale, index }: { post: BlogPost, locale: Locale, index: number }) {
  const translation = post.translations[locale];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/blog/${post.slug}`}>
        <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
          {post.imageUrl && (
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={translation.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className="bg-primary/90 text-primary-foreground mb-2">
                  Featured
                </Badge>
                <h3 className="text-xl font-bold text-white line-clamp-2">
                  {translation.title}
                </h3>
              </div>
            </div>
          )}
          <CardContent className="p-6">
            <p className="text-muted-foreground line-clamp-2 mb-4">
              {translation.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="capitalize">{post.category}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function PostCard({ post, locale, index }: { post: BlogPost, locale: Locale, index: number }) {
  const translation = post.translations[locale];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/blog/${post.slug}`}>
        <Card className="h-full hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {post.category}
              </Badge>
              {post.featured && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {translation.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="line-clamp-3 mb-4">
              {translation.excerpt}
            </CardDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <Button variant="ghost" size="sm" className="gap-1">
                Read more <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
