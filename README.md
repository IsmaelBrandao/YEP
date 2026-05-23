# YEP ⛽

> Comparador de preços de combustível perto de você.

App mobile que mostra no mapa os postos de combustível mais próximos com preço atualizado, permitindo filtrar por marca, tipo de combustível e serviços. MVP de startup fictícia desenvolvido para a disciplina de **Desenvolvimento Mobile** (UniC, Fortaleza-CE).

Inspirações reais: GasBuddy (EUA), Waze e o app Menor Preço Brasil (CONFAZ).

## Funcionalidades

- 🗺️ **Mapa** com os postos próximos e marcadores coloridos por preço (verde = mais barato, vermelho = mais caro)
- 📋 **Lista** ordenável por menor preço ou distância
- 🔎 **Filtros** por marca (Shell, Ipiranga, Petrobras/BR, Atem) e tipo de combustível
- 📍 **Detalhe do posto** com tabela de preços, serviços, rota no Google Maps e reporte de preço com foto do cupom
- ⭐ **Favoritos** e histórico de reportes persistidos no dispositivo
- 👤 **Perfil** com combustível padrão e raio de busca

## Stack

- Expo SDK 56 + Expo Router (file-based routing)
- TypeScript
- React Native 0.85 / React 19
- axios · expo-location · react-native-maps · expo-image-picker · async-storage
- Estado com `useState` / `useEffect` / `useContext`
- Estilização com `StyleSheet` puro

## Como rodar

```bash
npm install
npx expo start
```

Abra no **Expo Go** (Android/iOS) ou em um emulador. O mapa e a câmera não funcionam no navegador.

### Scripts

| Comando | O que faz |
|---|---|
| `npm start` | inicia o servidor de desenvolvimento |
| `npm run android` | abre no emulador/dispositivo Android |
| `npm run ios` | abre no simulador iOS (macOS) |
| `npm run lint` | roda o ESLint |

## Estrutura

```
app/        rotas (expo-router): splash, login, tabs e detalhe do posto
src/
  components/   PriceTag, FilterBar, StationCard
  services/     types, mock de postos, geo (Haversine), axios
  hooks/        useLocation, useStations, useFilters, AppDataContext
  styles/       theme (cores, espaçamentos, helpers)
```

> Os dados de postos e preços são **reais**: vêm do levantamento de preços de combustíveis dos **dados abertos da ANP** (últimas 4 semanas, Fortaleza-CE), com os endereços geocodificados via **OpenStreetMap (Nominatim)**. O dataset é gerado por `scripts/build-stations.mjs` e fica embutido em `src/services/stations.ts` (snapshot, sem backend). Não há autenticação real — o login é placeholder.

### Atualizar os dados de preços

```bash
# baixe os 2 CSVs da ANP (gasolina/etanol e diesel/gnv) para a pasta temporária
# e rode o gerador (geocodifica os endereços com cache em scripts/.geocode-cache.json):
node scripts/build-stations.mjs
```

Mais detalhes de arquitetura e convenções em [`AGENTS.md`](./AGENTS.md).
