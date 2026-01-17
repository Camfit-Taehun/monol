/**
 * 간단한 라이브러리 테스트
 */

import { RulebookManager, RuleSearch } from './foundations/logic/lib/index.js';

async function main() {
  console.log('=== Monol Rulebook 테스트 ===\n');

  // 1. RulebookManager 테스트
  console.log('1. RulebookManager 초기화...');
  const manager = new RulebookManager(process.cwd());

  // 2. 규칙 로드
  console.log('2. 규칙 로드 중...');
  const result = await manager.loadRulesForPath(process.cwd());

  console.log(`   로드된 규칙: ${result.rules.length}개`);
  console.log(`   소스: ${result.sources.join(', ')}`);

  if (result.errors.length > 0) {
    console.log(`   에러: ${result.errors.length}개`);
    result.errors.forEach(e => console.log(`     - ${e.file}: ${e.message}`));
  }

  // 3. 규칙 목록 출력
  console.log('\n3. 규칙 목록:');
  for (const rule of result.rules) {
    const icon = rule.severity === 'error' ? '🚫' : rule.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`   ${icon} ${rule.id}: ${rule.name}`);
    console.log(`      카테고리: ${rule.category}`);
    console.log(`      태그: ${rule.tags.join(', ')}`);
  }

  // 4. RuleSearch 테스트
  console.log('\n4. 검색 테스트...');
  const search = new RuleSearch(result.rules);

  // 태그로 검색
  const styleRules = search.searchByTags(['style']);
  console.log(`   "style" 태그 규칙: ${styleRules.length}개`);

  // 카테고리로 검색
  const codeRules = search.search({ category: 'code' });
  console.log(`   "code" 카테고리 규칙: ${codeRules.length}개`);

  // 5. 의존성 검사
  console.log('\n5. 의존성 검사...');
  const depResult = manager.validateAllDependencies();
  console.log(`   유효: ${depResult.valid}`);
  if (!depResult.valid) {
    depResult.errors.forEach(e => console.log(`   에러: ${e.message}`));
  }

  console.log('\n=== 테스트 완료 ===');
}

main().catch(console.error);
