const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'assets', 'i18n');
const files = fs.readdirSync(i18nPath).filter(f => f.endsWith('.json'));

// Load and parse all translation files
const translations = files.map(file => ({
  name: file,
  content: JSON.parse(fs.readFileSync(path.join(i18nPath, file), 'utf8'))
}));

// Recursive function to flatten nested keys
function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      acc.push(...flattenKeys(value, fullKey));
    } else {
      acc.push(fullKey);
    }
    return acc;
  }, []);
}

// Validate key consistency across files
const [base, ...others] = translations;
const baseKeys = flattenKeys(base.content);
let isValid = true;

for (const file of others) {
  const currentKeys = flattenKeys(file.content);
  const missingKeys = baseKeys.filter(key => !currentKeys.includes(key));
  const extraKeys = currentKeys.filter(key => !baseKeys.includes(key));

  if (missingKeys.length > 0 || extraKeys.length > 0) {
    isValid = false;
    console.error(`❌ Key mismatches found in ${file.name}`);
    if (missingKeys.length) {
      console.error(`  - Missing keys: ${missingKeys.join(', ')}`);
    }
    if (extraKeys.length) {
      console.error(`  - Extra keys: ${extraKeys.join(', ')}`);
    }
  }
}

if (!isValid) {
  console.error('\n🛑 Translation files are inconsistent. Please fix the mismatches before continuing.');
  process.exit(1);
} else {
  console.log('✅ All translation files have matching keys.');
}
