import { GetServerSideProps } from 'next';
import { getWatchlist } from '@/lib/db/supabase-client';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://git-score-v1.vercel.app';

function generateSiteMap(users: string[]) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static Routes -->
     <url>
       <loc>${SITE_URL}</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${SITE_URL}/compare</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>

     <!-- Dynamic User Routes -->
     ${users
            .map((username) => {
                return `
       <url>
           <loc>${`${SITE_URL}/score/${username}`}</loc>
           <lastmod>${new Date().toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.6</priority>
       </url>
     `;
            })
            .join('')}
   </urlset>
 `;
}

export default function SiteMap() {
    // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    try {
        // We fetch the watchlist to populate the sitemap with "hot" users
        const watchlist = await getWatchlist();
        const usernames = watchlist.map((item: any) => item.username);

        // Generate the XML sitemap with the posts data
        const sitemap = generateSiteMap(usernames);

        res.setHeader('Content-Type', 'text/xml');
        // Send the XML to the browser
        res.write(sitemap);
        res.end();

        return {
            props: {},
        };
    } catch (error) {
        console.error('Sitemap Error:', error);
        res.statusCode = 500;
        res.end();
        return { props: {} };
    }
};
