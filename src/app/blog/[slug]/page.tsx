'use client';

import { useBlog } from '@/hooks/useBlog';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { getPostBySlug, getRelatedPosts } = useBlog();
  const { t, locale } = useI18n();

  const post = getPostBySlug(slug as string);
  const relatedPosts = post ? getRelatedPosts(post.id) : [];

  if (!post) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    );
  }

  const translation = post.translations[locale];

  return (
    <article className="container py-12">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link href="/blog">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className="capitalize">
            {post.category}
          </Badge>
          {post.featured && (
            <Badge className="bg-amber-500 text-white">Featured</Badge>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          {translation.title}
        </h1>
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.ceil(translation.content.split(' ').length / 200)} min read
          </span>
        </div>
      </motion.header>

      {/* Featured Image */}
      {post.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-video max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden"
        >
          <Image
            src={post.imageUrl}
            alt={translation.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{translation.content}</ReactMarkdown>
        </div>

        {/* Share */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Share:</span>
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Facebook className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Author */}
        <div className="mt-12 p-6 bg-muted rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-sm text-muted-foreground">Author</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mt-16"
        >
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="space-y-4">
            {relatedPosts.map((relatedPost: any) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">
                      {relatedPost.translations[locale].title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedPost.translations[locale].excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </article>
  );
}
