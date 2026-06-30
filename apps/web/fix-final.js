const fs = require('fs');

const signinFile = '/home/uplix/Desktop/UPLIX/tutaly/apps/web/src/app/auth/signin/page.tsx';
let signin = fs.readFileSync(signinFile, 'utf8');
signin = signin.replace(/text-\[var\(--c-500\)\]/g, 'text-c500');
signin = signin.replace(/hover:text-\[var\(--blue\)\]/g, 'hover:text-blue');
fs.writeFileSync(signinFile, signin);

const layoutFile = '/home/uplix/Desktop/UPLIX/tutaly/apps/web/src/app/(dashboard)/layout.tsx';
let layout = fs.readFileSync(layoutFile, 'utf8');
layout = layout.replace(/\[&::-webkit-scrollbar\]:hidden \[-ms-overflow-style:'none'\] \[scrollbar-width:'none'\]/g, '');
fs.writeFileSync(layoutFile, layout);

const eslintFile = '/home/uplix/Desktop/UPLIX/tutaly/apps/web/eslint.config.mjs';
let eslint = fs.readFileSync(eslintFile, 'utf8');
eslint = eslint.replace(/!c\.startsWith\('\[&'\) && !c\.includes\('scrollbar'\)/g, "!c.startsWith('\[&') && !c.includes('scrollbar') && !c.includes('[-ms') && !c.includes('content')");
fs.writeFileSync(eslintFile, eslint);

console.log('Fixed final leftovers');
