const { execSync } = require('child_process');
execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
