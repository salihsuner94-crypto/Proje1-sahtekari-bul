import { useMemo, useReducer } from 'react';

import { ACTIONS, createInitialState, gameReducer } from '../game/gameReducer';

/**
 * Reducer'ı ekranların rahat kullanacağı bir API'ye çevirir.
 * Bileşenlere ham `dispatch` geçmek yerine isimlendirilmiş eylemler veriyoruz;
 * hem okunması kolay hem de action tipini yanlış yazma riski yok.
 */
export function useGameState(categories) {
  const [state, dispatch] = useReducer(gameReducer, categories, createInitialState);

  // useMemo: actions nesnesi her render'da yeniden üretilmesin (gereksiz render'ı önler).
  const actions = useMemo(
    () => ({
      addPlayer: () => dispatch({ type: ACTIONS.ADD_PLAYER }),
      removePlayer: (index) => dispatch({ type: ACTIONS.REMOVE_PLAYER, index }),
      setPlayerName: (index, name) => dispatch({ type: ACTIONS.SET_PLAYER_NAME, index, name }),
      setPlayerCount: (count) => dispatch({ type: ACTIONS.SET_PLAYER_COUNT, count }),
      toggleCategory: (categoryId) => dispatch({ type: ACTIONS.TOGGLE_CATEGORY, categoryId }),
      setAllCategories: (selected, categoryIds) =>
        dispatch({ type: ACTIONS.SET_ALL_CATEGORIES, selected, categoryIds }),
      setDuration: (seconds) => dispatch({ type: ACTIONS.SET_DURATION, seconds }),
      setImpostorCount: (count) => dispatch({ type: ACTIONS.SET_IMPOSTOR_COUNT, count }),
      setImpostorClueMode: (mode) => dispatch({ type: ACTIONS.SET_IMPOSTOR_CLUE_MODE, mode }),
      // Kategori verisini action ile geçiyoruz ki reducer veri dosyasına bağımlı olmasın.
      startGame: () => dispatch({ type: ACTIONS.START_GAME, categories }),
      nextReveal: () => dispatch({ type: ACTIONS.NEXT_REVEAL }),
      goToVoting: () => dispatch({ type: ACTIONS.GO_TO_VOTING }),
      castVote: (targetIndex) => dispatch({ type: ACTIONS.CAST_VOTE, targetIndex }),
      startNextRound: () => dispatch({ type: ACTIONS.START_NEXT_ROUND, categories }),
      resetGame: () => dispatch({ type: ACTIONS.RESET_GAME }),
    }),
    [categories],
  );

  return { state, actions };
}
