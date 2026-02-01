import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Star, StarOff, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { getAllBlogPostsAdmin } from '@/lib/blog'
import { deleteBlogPost, toggleBlogPostFeatured, toggleBlogPostPublished } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdmin()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus posts</p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Post
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {post.featured ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                    <span className="line-clamp-1">{post.translations.en.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">/{post.slug}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {post.category || 'general'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {post.published ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Publicado</Badge>
                  ) : (
                    <Badge variant="secondary">Rascunho</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <form action={toggleBlogPostPublished.bind(null, post.id, !post.published)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
                        {post.published ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </form>
                    <form action={toggleBlogPostFeatured.bind(null, post.id, !post.featured)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
                        {post.featured ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </form>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/admin/blog/edit/${post.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <form action={deleteBlogPost.bind(null, post.id)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" type="submit">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Nenhum post encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
