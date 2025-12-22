
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                process.env[match[1].trim()] = match[2].trim();
            }
        });
    }
} catch (e) {
    console.log('Could not read .env.local file', e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const articles = [
    {
        slug: 'artistic-vision-finding-creative-voice',
        title: 'Artistic Vision in Scenic Design: Finding My Creative Voice',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-01-31',
        excerpt: 'A reflection on artistic identity, creative independence, and building a scenic design career driven by authenticity rather than algorithmic validation.',
        cover_image: '/assets/images/blog/artistic-vision.png',
        tags: ['Design Philosophy', 'Artistic Vision', 'Creative Process', 'Portfolio Development', 'Theatre Career'],
        published: true
    },
    {
        slug: 'becoming-a-scenic-designer',
        title: 'Becoming a Scenic Designer: A Comprehensive Guide',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-09-16',
        excerpt: 'Everything you need to know about pursuing a career in scenic design, from education to professional practice.',
        cover_image: '/assets/images/blog/becoming-designer.png',
        tags: ['Scenic Design', 'Career Guide', 'Theatre Education', 'BFA Programs', 'MFA Programs', 'Portfolio'],
        published: true
    },
    {
        slug: 'scenic-rendering-principles',
        title: 'What Makes a Good Scenic Design Rendering?',
        category: 'Technology & Tutorials',
        published_at: '2025-09-16',
        excerpt: 'Drawing lessons from the Old Masters: atmospheric lighting, focal points, visual hierarchy, and architectural framing in scenic design visualization.',
        cover_image: 'https://images.unsplash.com/photo-1604952703578-8ae924053711?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwcmVuZGVyaW5nJTIwc2tldGNofGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Rendering', 'Vectorworks', 'Digital Design', 'Twinmotion', 'Concept Art', 'Lighting'],
        published: true
    },
    {
        slug: 'romero-set-design',
        title: 'Framing the Martyr: Scenic Design as Memory Work in Romero',
        category: 'Scenic Design Process & Highlights',
        published_at: '2025-08-31',
        excerpt: 'A deep dive into the scenic design process for Romero, exploring how physical space can frame memory and martyrdom.',
        cover_image: 'https://images.unsplash.com/photo-1747999827332-163aa33cd597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBwcm9jZXNzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Design Process', 'Case Study', 'University Production', 'Set Design', 'Symbolism'],
        published: true
    },
    {
        slug: 'scenic-design-lesson-youre-wasting-my-time',
        title: '"You\'re Wasting My Time" — A Scenic Design Lesson in Growth and Revision',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-09-16',
        excerpt: 'A formative moment at URTAs taught me the importance of intentionality, revision, and knowing your worth as a designer.',
        cover_image: 'https://images.unsplash.com/photo-1758669919394-b3eb103f5e48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwc3RhZ2UlMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Design Philosophy', 'Graduate School', 'Portfolio Review', 'Mentorship', 'URTA'],
        published: true
    },
    {
        slug: 'the-lights-were-already-on-maude-adams-legacy-at-stephens-college',
        title: 'The Lights Were Already On: Maude Adams\' Legacy at Stephens College',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-04-27',
        excerpt: 'Exploring the remarkable legacy of actress and lighting innovator Maude Adams at Stephens College.',
        cover_image: 'https://images.unsplash.com/photo-1580060372014-711bda378d20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwbGlnaHRpbmclMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Theatre History', 'Lighting', 'Architecture', 'Women in Theatre', 'Historic Theatres'],
        published: true
    },
    {
        slug: 'sora-in-the-studio-testing-ais-potential-for-theatrical-design',
        title: 'Sora in the Studio: Testing AI\'s Potential for Theatrical Design',
        category: 'Technology & Tutorials',
        published_at: '2025-09-16',
        excerpt: 'Exploring OpenAI\'s Sora video generation tool as a potential resource for scenic design visualization and concept development.',
        cover_image: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjE4MzY4OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['AI Tools', 'Technology', 'Sora', 'Visualization', 'Digital Design', 'Innovation'],
        published: true
    },
    {
        slug: 'jvtt8t7ek9xhgcd28j0zt2qha0v5cd',
        title: 'Designing the Keller Home: A Look Back at All My Sons',
        category: 'Scenic Design Process & Highlights',
        published_at: '2025-08-31',
        excerpt: 'Reflecting on the scenic design for Arthur Miller\'s All My Sons at Stephens College in 2010.',
        cover_image: 'https://images.unsplash.com/photo-1760768550727-00f5e02feb72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwYmFja3N0YWdlJTIwdGVjaG5pY2FsfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Design Process', 'Case Study', 'Arthur Miller', 'Realism', 'University Production'],
        published: true
    },
    {
        slug: 'computer-hardware-guide',
        title: 'Understanding Computer Hardware: Why Scenic Designers (and All Theatre Designers) Need to Care',
        category: 'Technology & Tutorials',
        published_at: '2025-08-31',
        excerpt: 'A comprehensive guide to computer hardware for theatre designers, from CPUs and GPUs to RAM and storage.',
        cover_image: 'https://images.unsplash.com/photo-1642736656789-65a6a0abbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGhhcmR3YXJlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjE2Mzc5ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Technology', 'Hardware', 'Computer Guide', 'Tech Education', 'Vectorworks'],
        published: true
    },
    {
        slug: 'scenic-design-vision',
        title: 'Scenic Design Vision: Brandon PT Davis Creates Artistic Spaces Beyond the Traditional Portfolio',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-08-31',
        excerpt: 'An overview of my design philosophy and approach to creating immersive theatrical environments.',
        cover_image: 'https://images.unsplash.com/photo-1758669919394-b3eb103f5e48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdHJlJTIwc3RhZ2UlMjBkZXNpZ258ZW58MXx8fHwxNzYxODk2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Design Philosophy', 'Scenic Design', 'Creative Process', 'Portfolio'],
        published: true
    },
    {
        slug: 'themed-entertainment-evolution',
        title: 'Themed Entertainment Design: Studio Ghibli-Inspired Immersive Dining Experience by Theatre Students',
        category: 'Experiential Design',
        published_at: '2025-09-15',
        excerpt: 'Stephens College theatre students create an immersive dining experience inspired by Studio Ghibli films.',
        cover_image: 'https://images.unsplash.com/photo-1692057418762-eeab24cd8505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVtZSUyMHBhcmslMjBjYXN0bGUlMjBtYWdpY3xlbnwxfHx8fDE3NjE3OTQ3NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Experiential Design', 'Themed Entertainment', 'Immersive Design', 'Student Project', 'Theme Parks'],
        published: true
    },
    {
        slug: 'presenting-like-apple',
        title: 'The Art of Presenting Theatre Design: A Guide for Designers',
        category: 'Technology & Tutorials',
        published_at: '2025-04-23',
        excerpt: 'Best practices for presenting your scenic design work to directors, collaborators, and production teams.',
        cover_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzZW50YXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYxNjM5Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Presentation Skills', 'Design Process', 'Communication', 'Keynote', 'Professional Skills'],
        published: true
    },
    {
        slug: 'navigating-the-scenic-design-process-a-comprehensive-guide',
        title: 'Navigating the Scenic Design Process: A Comprehensive Guide',
        category: 'Scenic Design Process & Highlights',
        published_at: '2025-08-31',
        excerpt: 'A step-by-step guide through the complete scenic design process, from script analysis to opening night.',
        cover_image: 'https://images.unsplash.com/photo-1747999827332-163aa33cd597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBwcm9jZXNzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTg5Njk5OHww&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Design Process', 'Workflow', 'Production Design', 'Creative Process', 'Guide'],
        published: true
    },
    {
        slug: 'computer-literacy',
        title: 'Empowering Theatre Production Students with Computer Literacy',
        category: 'Technology & Tutorials',
        published_at: '2025-09-15',
        excerpt: 'Why computer literacy matters for theatre production students and how to develop these essential skills.',
        cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzYxNjM4MDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Theatre Education', 'Tech Education', 'Digital Skills', 'Teaching', 'Computer Literacy'],
        published: true
    },
    {
        slug: 'video-game-environments',
        title: 'Video Game Environments: Lessons for Scenic Design',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-07-12',
        excerpt: 'Exploring how video game environment design principles can inform and enhance theatrical scenic design.',
        cover_image: 'https://images.unsplash.com/photo-1760802185763-fe4999466b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwZ2FtZSUyMGNvbmNlcHQlMjBhcnR8ZW58MXx8fHwxNzYxNzk0MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Game Design', 'Environment Design', 'Digital Design', 'Design Philosophy', 'Innovation'],
        published: true
    },
    {
        slug: 'opera-foundations',
        title: 'Opera\'s Foundations: The Evolution of Scenic Design in Opera',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-06-18',
        excerpt: 'A journey through the history of scenic design in opera, from the Baroque era to contemporary practice.',
        cover_image: 'https://images.unsplash.com/photo-1761359841098-8e84b7cf3661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVyYSUyMGhvdXNlJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NjE3OTUzMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Opera', 'Theatre History', 'Design History', 'Baroque', 'Historical Design'],
        published: true
    },
    {
        slug: 'golden-age-broadway',
        title: 'The Golden Age of Broadway: Scenic Design Excellence',
        category: 'Design Philosophy & Scenic Insights',
        published_at: '2025-05-22',
        excerpt: 'Celebrating the legendary scenic designers who defined Broadway\'s Golden Age and their lasting influence.',
        cover_image: 'https://images.unsplash.com/photo-1608587446131-b70c4664a62a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYnJvYWR3YXklMjB0aGVhdHJlJTIwZGlzdHJpY3QlMjAxOTUwc3xlbnwxfHx8fDE3NjE3OTYwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['Broadway', 'Theatre History', 'Design History', 'Golden Age', 'Historic Designers'],
        published: true
    }
];

const categories = [
    { name: 'Design Philosophy & Scenic Insights', slug: 'design-philosophy-scenic-insights', type: 'articles' },
    { name: 'Scenic Design Process & Highlights', slug: 'scenic-design-process-highlights', type: 'articles' },
    { name: 'Technology & Tutorials', slug: 'technology-tutorials', type: 'articles' },
    { name: 'Experiential Design', slug: 'experiential-design', type: 'articles' }
];

async function seed() {
    console.log('🌱 Seeding database...');

    // 1. Categories
    console.log('Checking categories...');
    for (const cat of categories) {
        const { error } = await supabase
            .from('categories')
            .upsert(cat, { onConflict: 'slug' });

        if (error) console.error(`Error saving category ${cat.name}:`, error.message);
    }

    // 2. Articles
    console.log('Seeding articles...');
    for (const article of articles) {
        // Check if exists
        const { data } = await supabase.from('articles').select('id').eq('slug', article.slug).single();

        if (!data) {
            console.log(`Creating: ${article.title}`);
            const { error } = await supabase
                .from('articles')
                .insert(article);

            if (error) console.error(`Error creating article ${article.slug}:`, error.message);
        } else {
            console.log(`Updating: ${article.title}`);
            const { error } = await supabase
                .from('articles')
                .update(article)
                .eq('slug', article.slug);

            if (error) console.error(`Error updating article ${article.slug}:`, error.message);
        }
    }

    console.log('✅ Seeding complete!');

    // Verify
    const { count } = await supabase.from('articles').select('*', { count: 'exact', head: true });
    console.log(`Current article count: ${count}`);
}

seed();
