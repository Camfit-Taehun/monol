---
description: Project coding rules
globs: **/*
alwaysApply: true
---

# Project Rules

## 변수명 규칙

**ID:** `naming-001` | **Severity:** 🟡 warning

변수명, 함수명, 클래스명에 대한 네이밍 컨벤션입니다.

- 변수/함수: camelCase
- 클래스/타입: PascalCase
- 상수: SCREAMING_SNAKE_CASE
- 파일명: kebab-case

### Correct
```
const userName = 'kent';
function getUserById(id: string) { }
class UserService { }
const MAX_RETRY_COUNT = 3;
// 파일명: user-service.ts
```

### Incorrect
```
const user_name = 'kent';
function GetUserById(id) { }
class user_service { }
const maxRetryCount = 3;  // 상수는 SCREAMING_CASE
// 파일명: UserService.ts
```

### Exceptions
- 외부 API 응답 객체의 snake_case 필드
- 레거시 코드와의 호환성이 필요한 경우


---

## 코드 포맷팅 규칙

**ID:** `style-001` | **Severity:** 🟡 warning

일관된 코드 포맷팅을 유지하기 위한 규칙입니다.
Prettier 설정을 따르며, 들여쓰기는 2칸 스페이스를 사용합니다.

### Correct
```
function greet(name: string) {
  return `Hello, ${name}!`;
}
const config = {
  indent: 2,
  semi: true,
};
```

### Incorrect
```
function greet(name:string){
return `Hello, ${name}!`
}
const config = {indent: 2,semi: true}
```

### Exceptions
- 자동 생성된 코드 (*.generated.ts)
- 벤더 라이브러리


---

## 커밋 메시지 규칙

**ID:** `git-001` | **Severity:** 🔴 error

Conventional Commits 형식을 따르는 커밋 메시지 규칙입니다.

형식: <type>(<scope>): <subject>

타입:
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 변경
- style: 코드 스타일 (포맷팅)
- refactor: 리팩토링
- test: 테스트 추가/수정
- chore: 빌드, 설정 변경

### Correct
```
feat(auth): add social login support
fix(api): resolve timeout issue in user endpoint
docs(readme): update installation guide
refactor(utils): extract date formatting logic
```

### Incorrect
```
fixed bug
WIP
asdf
Update user.ts
```

### Exceptions
- 머지 커밋 (자동 생성)
- 리버트 커밋


---
