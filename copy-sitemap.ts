import { copyFile } from 'fs';

copyFile('./src/assets/configs/sitemap.txt', './src/sitemap.txt', (err) => {
  if (err) {
    return console.log(err);
  }
});
