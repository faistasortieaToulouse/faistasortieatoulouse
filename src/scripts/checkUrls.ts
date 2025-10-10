// faistasortietest2/src/scripts/checkUrls.ts
import fetch from "node-fetch"; // npm install node-fetch@2
import categories from "../app/organiser-sorties/page"; // importe le tableau des catégories et URLs

// Fonction pour tester une URL
async function checkUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.ok) {
      return ""; // OK, pas de message
    } else {
      return `- Attention ! L'adresse de cette page a changé ! Navigue sur le site Web pour actualiser. : ${url}`;
    }
  } catch (err) {
    return `- Attention ! L'adresse de cette page a changé ! Navigue sur le site Web pour actualiser. : ${url}`;
  }
}

// Fonction principale
async function main() {
  for (const category of categories) {
    console.log(`\n📂 ${category.title}`);
    for (const url of category.links) {
      const message = await checkUrl(url);
      if (message) {
        console.log(message);
      }
    }
  }
}

main();
