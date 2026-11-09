import {build} from 'esbuild';
await build({entryPoints:['src/rosary-scene.js'],bundle:true,minify:true,format:'esm',target:'es2022',outfile:'wordpress/family-rosary/assets/rosary-scene.js',legalComments:'linked'});
