'use client';

import { useI18n } from '@/contexts/I18nContext';
import { useProjects } from '@/hooks/useProjects';
import { useCurriculum } from '@/hooks/useCurriculum';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, GraduationCap, Sparkles, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { t } = useI18n();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { items: curriculumItems, isLoading: curriculumLoading } = useCurriculum();

  const stats = [
    {
      title: t('admin.totalProjects'),
      value: projects.length,
      icon: FolderKanban,
      color: 'from-blue-500 to-cyan-500',
      loading: projectsLoading,
    },
    {
      title: t('admin.totalCVItems'),
      value: curriculumItems.length,
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-500',
      loading: curriculumLoading,
    },
    {
      title: t('admin.featuredProjects'),
      value: projects.filter(p => p.featured).length,
      icon: Sparkles,
      color: 'from-amber-500 to-orange-500',
      loading: projectsLoading,
    },
    {
      title: 'Published',
      value: projects.filter(p => p.published).length,
      icon: Eye,
      color: 'from-emerald-500 to-teal-500',
      loading: projectsLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stat.loading ? (
                    <span className="text-muted-foreground">...</span>
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : projects.length === 0 ? (
              <p className="text-muted-foreground">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">{project.category}</p>
                    </div>
                    {project.featured && <Sparkles className="h-4 w-4 text-amber-500" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-3">
                {['design', 'development', 'three-d', 'creative'].map((cat) => {
                  const count = projects.filter(p => p.category === cat).length;
                  const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{cat.replace('-', ' ')}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}