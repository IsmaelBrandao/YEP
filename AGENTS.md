# YEP — Comparador de preços de combustível

App mobile que mostra no mapa os postos de combustível mais próximos com preço atualizado, permitindo filtrar por marca, tipo de combustível e serviços. MVP de startup fictícia para a disciplina de Desenvolvimento Mobile (UniC, Fortaleza-CE).

> Expo mudou bastante: consulte sempre a doc versionada em https://docs.expo.dev/versions/v56.0.0/ antes de escrever código.

## Stack

- Expo SDK 56 + Expo Router (file-based routing)
- TypeScript estrito
- React Native 0.85 / React 19
- axios (HTTP)
- expo-location (geolocalização)
- react-native-maps (mapa)
- expo-image-picker (foto do cupom)
- @react-native-async-storage/async-storage (favoritos e reportes)
- @react-native-community/slider (raio de busca)
- @expo/vector-icons (MaterialCommunityIcons)
- StyleSheet puro (sem NativeWind/Tailwind)
- Estado com useState/useEffect/useContext (sem Zustand/Redux)

## Estrutura

```
YEP/
├── app/                       # rotas (expo-router)
│   ├── _layout.tsx            # Stack root + AppDataProvider
│   ├── index.tsx              # Splash
│   ├── login.tsx              # Login (placeholder)
│   ├── (tabs)/
│   │   ├── _layout.tsx        # bottom tabs
│   │   ├── map.tsx            # mapa com marcadores
│   │   ├── list.tsx           # lista ordenável
│   │   └── profile.tsx        # perfil
│   └── station/[id].tsx       # detalhe do posto
└── src/
    ├── components/            # PriceTag, FilterBar, StationCard
    ├── services/              # types.ts, stations.ts (mock), geo.ts, api.ts
    ├── hooks/                 # useLocation, useStations, useFilters, AppDataContext
    ├── styles/                # theme.ts
    └── assets/
```

## Convenções

- UI em português, código em inglês.
- Componentes via `function declaration` (não arrow).
- `StyleSheet.create` no fim de cada arquivo.
- Ordem de imports: libs externas → libs internas (`src/`) → componentes locais.
- TypeScript estrito, sem comentários óbvios.

## Como rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (Android/iOS) ou em um emulador. O mapa (`react-native-maps`) e a câmera não funcionam no navegador.

## Decisões de arquitetura

- **Sem backend:** todos os dados vêm de `src/services/stations.ts` (15 postos reais de Fortaleza). `src/services/api.ts` é só a instância axios pronta para uso futuro.
- **Sem auth real:** o login valida apenas que os campos não estão vazios e navega para as tabs.
- **Estado global:** favoritos e histórico de reportes ficam em `AppDataContext` (useContext) e são persistidos no AsyncStorage.
- **Distância:** calculada no cliente via Haversine (`src/services/geo.ts`) a partir da localização do usuário.
- **Cor do preço:** `priceColor()` em `theme.ts` mapeia o preço para verde/laranja/vermelho conforme a faixa min–max dos postos visíveis.
- **Slider:** `@react-native-community/slider` foi adicionado porque o React Native não tem mais Slider nativo (usado no raio de busca do perfil).
- **Mapa multiplataforma:** o `react-native-maps` não funciona na web, então o mapa fica isolado no componente `StationsMap`, com duas variantes resolvidas pelo Metro por extensão de plataforma:
  - `StationsMap.tsx` (nativo) → `react-native-maps`
  - `StationsMap.web.tsx` (web) → Leaflet + tiles do OpenStreetMap (grátis, sem API key)
- **`web.output: "single"`:** a saída web é SPA (sem SSR). Necessário porque o Leaflet acessa `window` no carregamento, o que quebra no server-side rendering do modo `static`.
