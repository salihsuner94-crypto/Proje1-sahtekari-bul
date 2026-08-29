import {
  DEFAULT_DURATION_SECONDS,
  DEFAULT_IMPOSTOR_CLUE_MODE,
  MAX_DURATION_SECONDS,
  MAX_IMPOSTORS,
  MAX_PLAYERS,
  MIN_DURATION_SECONDS,
  MIN_PLAYERS,
  MIN_PLAYERS_FOR_TWO_IMPOSTORS,
  PHASES,
} from '../constants/gameConfig';
import { createRound } from './roundSetup';
import { awardPoints, resolveVoting } from './voting';

/**
 * Oyunun TÜM durumu tek bir reducer'da. Ekranlar sadece "şunu yap" der,
 * kuralları burası bilir. Böylece bir kuralı değiştirmek istediğinde
 * bileşenlerin içinde arama yapmak zorunda kalmıyorsun.
 */

export const ACTIONS = {
  ADD_PLAYER: 'ADD_PLAYER',
  REMOVE_PLAYER: 'REMOVE_PLAYER',
  SET_PLAYER_NAME: 'SET_PLAYER_NAME',
  SET_PLAYER_COUNT: 'SET_PLAYER_COUNT',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY',
  SET_ALL_CATEGORIES: 'SET_ALL_CATEGORIES',
  SET_DURATION: 'SET_DURATION',
  SET_IMPOSTOR_COUNT: 'SET_IMPOSTOR_COUNT',
  SET_IMPOSTOR_CLUE_MODE: 'SET_IMPOSTOR_CLUE_MODE',
  START_GAME: 'START_GAME',
  NEXT_REVEAL: 'NEXT_REVEAL',
  GO_TO_VOTING: 'GO_TO_VOTING',
  CAST_VOTE: 'CAST_VOTE',
  START_NEXT_ROUND: 'START_NEXT_ROUND',
  RESET_GAME: 'RESET_GAME',
};

/**
 * @param {{id: string}[]} categories - doğrulanmış kategori listesi
 */
export function createInitialState(categories) {
  return {
    phase: PHASES.SETUP,
    settings: {
      // Boş string = "kullanıcı isim yazmadı". Oyun başlarken "Oyuncu 1" gibi
      // varsayılanlarla doldurulur (bkz. normalizePlayerNames).
      players: ['', '', ''],
      selectedCategoryIds: categories.map((category) => category.id), // varsayılan: hepsi açık
      durationSeconds: DEFAULT_DURATION_SECONDS,
      impostorCount: 1,
      impostorClueMode: DEFAULT_IMPOSTOR_CLUE_MODE,
    },
    round: null,
    votes: {},
    currentVoterIndex: 0,
    result: null,
    scores: [],
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_PLAYER: {
      const { players } = state.settings;
      if (players.length >= MAX_PLAYERS) return state;
      return withSettings(state, { players: [...players, ''] });
    }

    case ACTIONS.REMOVE_PLAYER: {
      const { players, impostorCount } = state.settings;
      if (players.length <= MIN_PLAYERS) return state;
      const nextPlayers = players.filter((_, index) => index !== action.index);
      return withSettings(state, {
        players: nextPlayers,
        // Oyuncu sayısı 8'in altına düşerse 2. sahtekâr geçersiz kalır; otomatik düzelt.
        impostorCount: clampImpostorCount(impostorCount, nextPlayers.length),
      });
    }

    case ACTIONS.SET_PLAYER_NAME: {
      const nextPlayers = state.settings.players.map((name, index) =>
        index === action.index ? action.name : name,
      );
      return withSettings(state, { players: nextPlayers });
    }

    case ACTIONS.SET_PLAYER_COUNT: {
      const targetCount = clamp(action.count, MIN_PLAYERS, MAX_PLAYERS);
      const { players, impostorCount } = state.settings;
      if (targetCount === players.length) return state;

      const nextPlayers =
        targetCount > players.length
          ? [...players, ...Array(targetCount - players.length).fill('')]
          : players.slice(0, targetCount); // fazlalığı sondan kırp

      return withSettings(state, {
        players: nextPlayers,
        impostorCount: clampImpostorCount(impostorCount, nextPlayers.length),
      });
    }

    case ACTIONS.TOGGLE_CATEGORY: {
      const { selectedCategoryIds } = state.settings;
      const isSelected = selectedCategoryIds.includes(action.categoryId);
      return withSettings(state, {
        selectedCategoryIds: isSelected
          ? selectedCategoryIds.filter((id) => id !== action.categoryId)
          : [...selectedCategoryIds, action.categoryId],
      });
    }

    case ACTIONS.SET_ALL_CATEGORIES: {
      return withSettings(state, {
        selectedCategoryIds: action.selected ? [...action.categoryIds] : [],
      });
    }

    case ACTIONS.SET_DURATION: {
      return withSettings(state, {
        durationSeconds: clamp(action.seconds, MIN_DURATION_SECONDS, MAX_DURATION_SECONDS),
      });
    }

    case ACTIONS.SET_IMPOSTOR_COUNT: {
      return withSettings(state, {
        impostorCount: clampImpostorCount(action.count, state.settings.players.length),
      });
    }

    case ACTIONS.SET_IMPOSTOR_CLUE_MODE: {
      return withSettings(state, { impostorClueMode: action.mode });
    }

    case ACTIONS.START_GAME: {
      // Buton zaten pasif ama reducer da kendini korusun (ikinci savunma hattı).
      if (!canStartGame(state.settings)) return state;

      const players = normalizePlayerNames(state.settings.players);
      const settings = { ...state.settings, players };
      const round = createRound({ settings, categories: action.categories, roundNumber: 1 });

      // Kelime havuzu boşsa oyunu başlatmıyoruz; kurulumda kalıyoruz.
      if (!round) return state;

      return {
        ...state,
        phase: PHASES.REVEAL,
        settings,
        scores: players.map(() => 0),
        round,
        votes: {},
        currentVoterIndex: 0,
        result: null,
      };
    }

    case ACTIONS.NEXT_REVEAL: {
      if (state.phase !== PHASES.REVEAL || !state.round) return state;

      const nextIndex = state.round.revealIndex + 1;

      // Son oyuncu da rolünü gördüyse tartışma turu başlar.
      if (nextIndex >= state.settings.players.length) {
        return { ...state, phase: PHASES.DISCUSSION };
      }

      return { ...state, round: { ...state.round, revealIndex: nextIndex } };
    }

    case ACTIONS.GO_TO_VOTING: {
      // Süre bitince otomatik, "Oylamaya Geç" ile elle çağrılıyor. İkisi aynı anda
      // gelebilir; faz kontrolü sayesinde ikincisi sessizce yok sayılır.
      if (state.phase !== PHASES.DISCUSSION) return state;
      return { ...state, phase: PHASES.VOTING, votes: {}, currentVoterIndex: 0 };
    }

    case ACTIONS.CAST_VOTE: {
      if (state.phase !== PHASES.VOTING || !state.round) return state;

      const voterIndex = state.currentVoterIndex;
      const playerCount = state.settings.players.length;
      const { targetIndex } = action;

      // Kendine oy vermek ve listede olmayan birine oy vermek yasak.
      if (targetIndex === voterIndex) return state;
      if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= playerCount) {
        return state;
      }

      const votes = { ...state.votes, [voterIndex]: targetIndex };
      const nextVoterIndex = voterIndex + 1;

      // Sıra sonraki oyuncuya geçiyor.
      if (nextVoterIndex < playerCount) {
        return { ...state, votes, currentVoterIndex: nextVoterIndex };
      }

      // Herkes oy verdi: sonucu hesapla, puanları dağıt.
      const result = resolveVoting({
        votes,
        impostorIndexes: state.round.impostorIndexes,
        playerCount,
      });

      return {
        ...state,
        votes,
        currentVoterIndex: nextVoterIndex,
        phase: PHASES.RESULT,
        result,
        scores: awardPoints(state.scores, result.winner, state.round.impostorIndexes),
      };
    }

    case ACTIONS.START_NEXT_ROUND: {
      if (state.phase !== PHASES.RESULT || !state.round) return state;

      const round = createRound({
        settings: state.settings,
        categories: action.categories,
        roundNumber: state.round.number + 1,
        previousWord: state.round.word, // arka arkaya aynı kelime çıkmasın
      });

      if (!round) return state;

      // Puanlar bilerek korunuyor: oturum boyunca birikiyorlar.
      return { ...state, phase: PHASES.REVEAL, round, votes: {}, currentVoterIndex: 0, result: null };
    }

    case ACTIONS.RESET_GAME: {
      // Kurulum ekranına dön ama ayarları koru; baştan isim yazdırmak eziyet olur.
      return { ...state, phase: PHASES.SETUP, round: null, votes: {}, result: null, scores: [] };
    }

    default:
      return state;
  }
}

/* ---------- yardımcılar ---------- */

function withSettings(state, partialSettings) {
  return { ...state, settings: { ...state.settings, ...partialSettings } };
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** 2. sahtekâr yalnızca 8+ oyuncuda seçilebilir. */
export function clampImpostorCount(count, playerCount) {
  const maxAllowed = playerCount >= MIN_PLAYERS_FOR_TWO_IMPOSTORS ? MAX_IMPOSTORS : 1;
  return clamp(count, 1, maxAllowed);
}

/** Boş bırakılan isimleri "Oyuncu 3" gibi varsayılanlarla doldurur. */
export function normalizePlayerNames(players) {
  return players.map((name, index) => name.trim() || `Oyuncu ${index + 1}`);
}

/** Reducer'ın kendi guard'ı — kategori verisine ihtiyaç duymayan asgari kontrol. */
function canStartGame(settings) {
  return (
    settings.players.length >= MIN_PLAYERS &&
    settings.players.length <= MAX_PLAYERS &&
    settings.selectedCategoryIds.length > 0
  );
}
