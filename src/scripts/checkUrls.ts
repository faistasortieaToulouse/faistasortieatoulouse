// checkUrls.ts
import fs from 'fs';
import fetch from 'node-fetch';
import { categories } from './urlsList'; // liste de tous les liens

(async () => {
  const results: Record<string, string> = {};

  for (const category of categories) {
    for (const url of category.links) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        results[url] = res.ok ? '' : '— Attention ! L’adresse de cette page a changé, merci de parcourir le site web.';
      } catch {
        results[url] = '— Attention ! L’adresse de cette page a changé, merci de parcourir le site web.';
      }
    }
  }

  fs.writeFileSync('src/lib/checkUrlsResults.json', JSON.stringify(results, null, 2));
  console.log('Vérification terminée');
})();
