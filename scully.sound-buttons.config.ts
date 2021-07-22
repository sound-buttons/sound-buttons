import { ScullyConfig } from '@scullyio/scully';
export const config: ScullyConfig = {
  projectRoot: './src',
  projectName: 'sound-buttons',
  outDir: './dist/static',
  routes: {
    '/:name': {
      type: 'json',
      name: {
        url: 'https://sound-buttons.maki0419.com/assets/configs/main.json',
        property: 'name',
      },
    },
  }
};
