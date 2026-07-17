const { execSync } = require('child_process');

console.log('🚀 Starting build checks for client and server...');

try {
  console.log('\n📦 Building server...');
  execSync('npm run build', { cwd: './server', stdio: 'inherit' });

  console.log('\n📦 Building client...');
  execSync('npm run build', { cwd: './client', stdio: 'inherit' });

  console.log('\n✅ All builds passed successfully! You are good to push.');
} catch (error) {
  console.error('\n❌ Build failed. Please fix the issues before pushing.');
  process.exit(1);
}
