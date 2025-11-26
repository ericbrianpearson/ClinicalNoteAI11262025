import fs from 'fs';
import path from 'path';

async function validateLinks(dir: string) {
  const files = fs.readdirSync(dir);
  let brokenLinks: string[] = [];
  let totalLinks = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        const subdirResults = await validateLinks(filePath);
        brokenLinks = brokenLinks.concat(subdirResults.brokenLinks);
        totalLinks += subdirResults.totalLinks;
      }
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = [...content.matchAll(/https?:\/\/[^\s"')]+/g)];
      
      for (const match of matches) {
        totalLinks++;
        try {
          const response = await fetch(match[0], { 
            method: 'HEAD',
            timeout: 5000
          });
          if (!response.ok) {
            console.log(`❌ Broken link in ${filePath}: ${match[0]} (Status: ${response.status})`);
            brokenLinks.push(`${filePath}: ${match[0]}`);
          } else {
            console.log(`✅ Valid link: ${match[0]}`);
          }
        } catch (e) {
          console.log(`❌ Error checking ${match[0]} in ${filePath}: ${(e as Error).message}`);
          brokenLinks.push(`${filePath}: ${match[0]} (Error: ${(e as Error).message})`);
        }
      }
    }
  }
  
  return { brokenLinks, totalLinks };
}

async function main() {
  console.log('🔍 Starting comprehensive link validation...');
  
  const clientResults = await validateLinks('./client/src');
  const serverResults = await validateLinks('./server');
  
  const totalBroken = clientResults.brokenLinks.length + serverResults.brokenLinks.length;
  const totalChecked = clientResults.totalLinks + serverResults.totalLinks;
  
  console.log('\n📊 Link Validation Summary:');
  console.log(`Total links checked: ${totalChecked}`);
  console.log(`Broken links found: ${totalBroken}`);
  console.log(`Success rate: ${((totalChecked - totalBroken) / totalChecked * 100).toFixed(1)}%`);
  
  if (totalBroken > 0) {
    console.log('\n❌ Broken links:');
    [...clientResults.brokenLinks, ...serverResults.brokenLinks].forEach(link => {
      console.log(`  ${link}`);
    });
  } else {
    console.log('\n✅ All links are valid!');
  }
}

main().catch(console.error);