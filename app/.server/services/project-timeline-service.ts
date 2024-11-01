import { ProjectTimelines } from '@/db/schema'
import { AppLoadContext } from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'

export class ProjectTimelineService {
  constructor(private db: AppLoadContext['db']) {}

  public getProjectTimeline = (projectId: string) => {
    return this.db.query.ProjectTimelines.findFirst({
      where: eq(ProjectTimelines.projectId, projectId),
      with: {
        timelineItems: {
          orderBy: (timelineItems, { asc }) => [asc(timelineItems.monthNumber)],
          with: {
            timelineItemToProjectModules: {
              with: {
                projectModule: {
                  columns: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  public updateProjectTimeline = (projectId: string, summary: string) => {
    return this.db
      .update(ProjectTimelines)
      .set({ summary })
      .where(eq(ProjectTimelines.projectId, projectId))
      .returning()
  }
}
