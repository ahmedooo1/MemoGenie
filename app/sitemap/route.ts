import { NextResponse } from 'next/server';
import { getAllProjects, getChaptersByProject } from '@/lib/database';

export async function GET() {
  try {
    const projects = getAllProjects();

    const baseUrl = 'https://memogenie.aaweb.fr';

    let urls: { loc: string; lastmod?: string }[] = [];

    // Homepage
    urls.push({ loc: `${baseUrl}/`, lastmod: new Date().toISOString() });

    // Projects and chapters
    for (const p of projects) {
      const projUrl = `${baseUrl}/projects/${p.id}`;
      urls.push({ loc: projUrl, lastmod: p.updated_at || p.created_at });

      const chapters = getChaptersByProject(p.id as number);
      for (const c of chapters) {
        const chapUrl = `${projUrl}/chapters/${c.id}`;
        urls.push({ loc: chapUrl, lastmod: c.updated_at || c.created_at });
      }
    }

    const xmlParts: string[] = [];
    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlParts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    for (const u of urls) {
      xmlParts.push('  <url>');
      xmlParts.push(`    <loc>${u.loc}</loc>`);
      if (u.lastmod) {
        const last = new Date(u.lastmod).toISOString();
        xmlParts.push(`    <lastmod>${last}</lastmod>`);
      }
      xmlParts.push('  </url>');
    }

    xmlParts.push('</urlset>');

    const xml = xmlParts.join('\n');

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (e) {
    console.error('Error generating sitemap:', e);
    return NextResponse.json({ error: 'Unable to generate sitemap' }, { status: 500 });
  }
}
