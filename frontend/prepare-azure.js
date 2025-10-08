// Script para preparar o frontend para deploy no Azure
const fs = require('fs');
const path = require('path');

console.log('🔧 Preparando frontend para Azure...');

// Ler package.json
const packagePath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Garantir que serve está nas dependencies
if (!pkg.dependencies.serve) {
    console.log('📦 Adicionando serve às dependencies...');
    pkg.dependencies.serve = '^14.2.0';
}

// Garantir que react-scripts está nas dependencies (necessário para build)
if (!pkg.dependencies['react-scripts'] && pkg.devDependencies['react-scripts']) {
    console.log('📦 Movendo react-scripts para dependencies...');
    pkg.dependencies['react-scripts'] = pkg.devDependencies['react-scripts'];
    delete pkg.devDependencies['react-scripts'];
}

// Garantir que o script start está correto
console.log('🛠️ Configurando script start para produção...');
pkg.scripts.start = 'npx serve -s build -l 8080';
pkg.scripts.serve = 'serve -s build -l 8080';
pkg.scripts.dev = 'react-scripts start';

// Salvar package.json
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

console.log('✅ Frontend preparado para Azure!');
console.log('Scripts configurados:');
console.log('  - npm run dev: desenvolvimento local');
console.log('  - npm run build: build para produção');
console.log('  - npm start: servir arquivos estáticos (Azure)');