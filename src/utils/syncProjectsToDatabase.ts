// Utility to sync hardcoded projects to database
// Run this once from the admin panel to populate the database

import { projects as hardcodedProjects } from '../data/projects';
import { projectId, publicAnonKey } from './supabase/info';

export async function syncProjectsToDatabase() {
  const adminToken = sessionStorage.getItem('admin_token');
  if (!adminToken) {
    throw new Error('Admin token not found');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // First, fetch all existing projects to preserve manually edited data
  try {
    const existingProjectsResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`,
      {
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': adminToken 
        },
      }
    );
    const existingData = await existingProjectsResponse.json();
    const existingProjects = existingData.success ? existingData.projects || [] : [];
    
    // Create a map for quick lookup
    const existingProjectsMap = new Map(
      existingProjects.map((p: any) => [p.id, p])
    );

    for (const project of hardcodedProjects) {
      try {
        // Check if project exists and has manually edited data
        const existing = existingProjectsMap.get(project.id);
        const hasManualGalleries = existing?.galleries && (
          (existing.galleries.hero && existing.galleries.hero.length > 0) ||
          (existing.galleries.process && existing.galleries.process.length > 0)
        );
        const hasManualTags = existing?.tags && existing.tags.length > 0;
        const hasManualNotes = existing?.designNotes && existing.designNotes.length > 0;
        const hasManualVideos = existing?.youtubeVideos && existing.youtubeVideos.length > 0;
        
        // Convert hardcoded project to database format
        const dbProject = {
          id: project.id,
          slug: project.id,
          title: project.title,
          venue: project.venue,
          location: project.location,
          year: project.year,
          month: project.month || 1,
          category: project.category,
          subcategory: project.subcategory,
          description: project.description,
          image: project.image,
          cardImage: project.cardImage || project.image,
          featured: project.featured || false,
          
          // PRESERVE manually edited fields if they exist
          galleries: hasManualGalleries 
            ? existing.galleries 
            : (project.category === 'Scenic Design' ? {
                hero: project.image ? [project.image] : [],
                heroCaptions: project.image ? [`Production photo from ${project.title} at ${project.venue}`] : [],
                process: [],
                processCaptions: [],
                details: [],
                detailsCaptions: [],
              } : undefined),
          
          tags: hasManualTags 
            ? existing.tags 
            : [],
          
          designNotes: hasManualNotes 
            ? existing.designNotes 
            : (project.category === 'Scenic Design' ? [
                project.description,
                `This production at ${project.venue} explored the intersection of architectural form and theatrical storytelling, creating an immersive environment that served both practical and symbolic purposes.`,
              ] : undefined),
          
          youtubeVideos: hasManualVideos 
            ? existing.youtubeVideos 
            : [],
          
          // Keep engagement metrics
          likes: existing?.likes || 0,
          views: existing?.views || 0,
          
          // Add sample collaborators (convert old credits format)
          credits: project.credits ? (() => {
            const creditsArray = [];
            if (project.credits.director) creditsArray.push({ role: 'Director', name: project.credits.director });
            if (project.credits.scenicDesigner) creditsArray.push({ role: 'Scenic Designer', name: project.credits.scenicDesigner });
            if (project.credits.coDesigner) creditsArray.push({ role: 'Co-Scenic Designer', name: project.credits.coDesigner });
            if (project.credits.costumeDesigner) creditsArray.push({ role: 'Costume Designer', name: project.credits.costumeDesigner });
            if (project.credits.lightingDesigner) creditsArray.push({ role: 'Lighting Designer', name: project.credits.lightingDesigner });
            if (project.credits.soundDesigner) creditsArray.push({ role: 'Sound Designer', name: project.credits.soundDesigner });
            if (project.credits.projectionDesigner) creditsArray.push({ role: 'Projection Designer', name: project.credits.projectionDesigner });
            if (project.credits.choreographer) creditsArray.push({ role: 'Choreographer', name: project.credits.choreographer });
            if (project.credits.musicalDirector) creditsArray.push({ role: 'Musical Director', name: project.credits.musicalDirector });
            return creditsArray;
          })() : (project.category === 'Scenic Design' ? [
            { name: 'Director', role: 'Director' },
            { name: 'Lighting Designer', role: 'Lighting Design' },
            { name: 'Costume Designer', role: 'Costume Design' },
          ] : []),
          
          // For experiential projects - blog-style content with mixed blocks
          content: project.category === 'Experiential Design' ? [
            {
              type: 'text',
              content: project.description,
            },
            {
              type: 'heading',
              content: 'Design Concept',
            },
            {
              type: 'text',
              content: `The ${project.title} project at ${project.venue} represents an innovative approach to experiential design, blending theatrical principles with immersive installation techniques. Every element was carefully crafted to create a cohesive narrative environment.`,
            },
            ...(project.image ? [{
              type: 'image' as const,
              src: project.image,
              caption: `${project.title} - ${project.venue}, ${project.year}`,
            }] : []),
          ] : undefined,
        };

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/projects`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Admin-Token': adminToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dbProject),
          }
        );

        if (response.ok) {
          results.success++;
          console.log(`✅ Synced: ${project.title}${hasManualGalleries || hasManualTags || hasManualNotes || hasManualVideos ? ' (preserved manual edits)' : ''}`);
        } else {
          const error = await response.text();
          results.failed++;
          results.errors.push(`${project.title}: ${error}`);
          console.error(`❌ Failed to sync ${project.title}:`, error);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${project.title}: ${errorMsg}`);
        console.error(`❌ Error syncing ${project.title}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching existing projects:', error);
    throw new Error('Failed to fetch existing projects for preservation');
  }

  return results;
}