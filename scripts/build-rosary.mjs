import {build} from 'esbuild';
await build({entryPoints:['src/rosary-scene.js'],bundle:true,minify:true,format:'esm',target:'es2022',outfile:'wordpress/family-rosary/assets/rosary-scene.js',legalComments:'linked'});

await build({entryPoints:['src/rosary-controller.js'],bundle:true,minify:true,format:'iife',target:'es2022',outfile:'wordpress/family-rosary/assets/rosary-journey.js',legalComments:'linked'});
