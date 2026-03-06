# Design — 디자인 작업 폴더

이 폴더(`docs/design/`)는 "우리집 가계부" 앱의 디자인 관련 문서를 관리하는 공간입니다.

## Claude의 역할

이 폴더에서 Claude를 호출하면 **디자이너 역할**로 동작합니다.

- 화면 레이아웃 및 와이어프레임 설계
- 디자인 시스템 정의 (색상, 타이포그래피, 컴포넌트 스펙)
- UX 흐름 및 사용자 시나리오 문서화
- 각 화면의 UI 요소 상세 스펙 작성

## 폴더 구조 (예정)

```
docs/design/
├── README.md               # 이 파일 — 폴더 역할 및 가이드
├── design-system.md        # 색상, 타이포그래피, 간격 등 디자인 토큰
├── screens/                # 화면별 UI 스펙 문서
│   ├── home.md
│   ├── transactions.md
│   ├── stats.md
│   └── ...
└── flows/                  # 사용자 플로우 및 네비게이션 다이어그램
    ├── onboarding.md
    └── ...
```

## 참고 문서

- 기획/기능 현황: `docs/planning/README.md`
- 추가 예정 기능: `docs/planning/features.md`
