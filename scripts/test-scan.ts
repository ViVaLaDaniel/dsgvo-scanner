import { analyzeWebsite } from '../lib/scan-engine';

async function test() {
  const url = process.argv[2] || 'https://www.google.com';
  console.log(`🔍 Начинаю сканирование: ${url}...`);

  try {
    const result = await analyzeWebsite(url);
    console.log('\n📊 Результат сканирования:');
    console.log(`Счет: ${result.score}/100`);
    console.log(`Найдено нарушений/предупреждений: ${result.findings.length}`);

    result.findings.forEach((f, i) => {
      console.log(`\n[${i + 1}] ${f.title}`);
      console.log(`   Категория: ${f.category}`);
      console.log(`   Статус: ${f.status} | Важность: ${f.severity}`);
      console.log(`   Причина: ${f.description_de}`);
    });
  } catch (error) {
    console.error('❌ Ошибка теста:', error);
  }
}

test();
