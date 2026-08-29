import { PHASES } from './constants/gameConfig';
import { CATEGORY_ISSUES, GAME_CATEGORIES } from './data';
import { useGameState } from './hooks/useGameState';
import Card from './components/ui/Card';
import SetupScreen from './components/screens/SetupScreen';
import RoleRevealScreen from './components/screens/RoleRevealScreen';
import DiscussionScreen from './components/screens/DiscussionScreen';
import VotingScreen from './components/screens/VotingScreen';
import ResultScreen from './components/screens/ResultScreen';

/**
 * Uygulamanın tek görevi: duruma bakıp hangi ekranın gösterileceğine karar vermek.
 * Oyun kuralları burada değil, game/ klasöründe.
 */
export default function App() {
  const { state, actions } = useGameState(GAME_CATEGORIES);

  return (
    <div className="app">
      <div className="app__inner">
        <header>
          <h1 className="app__title">🕵️ Sahtekarı Bul</h1>
          <p className="app__subtitle">Tek cihazda, sırayla oynanan kelime oyunu</p>
        </header>

        {GAME_CATEGORIES.length === 0 ? (
          <Card title="Kelime verisi yüklenemedi">
            <p className="app__subtitle">
              Geçerli kategori bulunamadı. <code>src/data/categories.js</code> dosyasını kontrol et.
            </p>
            <ul className="message-list message-list--error">
              {CATEGORY_ISSUES.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </Card>
        ) : (
          renderPhase(state, actions)
        )}
      </div>
    </div>
  );
}

function renderPhase(state, actions) {
  switch (state.phase) {
    case PHASES.SETUP:
      return (
        <SetupScreen
          settings={state.settings}
          categories={GAME_CATEGORIES}
          categoryIssues={CATEGORY_ISSUES}
          actions={actions}
        />
      );

    case PHASES.REVEAL:
      return (
        <RoleRevealScreen
          round={state.round}
          players={state.settings.players}
          onNext={actions.nextReveal}
        />
      );

    case PHASES.DISCUSSION:
      return (
        <DiscussionScreen
          round={state.round}
          settings={state.settings}
          onGoToVoting={actions.goToVoting}
        />
      );

    case PHASES.VOTING:
      return (
        <VotingScreen
          players={state.settings.players}
          currentVoterIndex={state.currentVoterIndex}
          onCastVote={actions.castVote}
        />
      );

    case PHASES.RESULT:
      return (
        <ResultScreen
          round={state.round}
          settings={state.settings}
          result={state.result}
          votes={state.votes}
          scores={state.scores}
          onNextRound={actions.startNextRound}
          onFinish={actions.resetGame}
        />
      );

    // Buraya düşmemesi gerekiyor; düşerse kurulumdan başlamak en güvenlisi.
    default:
      return null;
  }
}
