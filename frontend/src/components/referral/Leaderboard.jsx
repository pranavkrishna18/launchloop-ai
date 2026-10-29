import { useState, useEffect } from 'react';
import { Trophy, Medal, RefreshCw, AlertCircle, Users } from 'lucide-react';
import { getLeaderboard } from '../../api/registration';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(15);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      setError(err.message || 'Unable to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-lg bg-lime text-obsidian flex items-center justify-center font-mono font-bold text-xs">
          01
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-lg bg-tangerine text-obsidian flex items-center justify-center font-mono font-bold text-xs">
          02
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-lg bg-sage text-obsidian flex items-center justify-center font-mono font-bold text-xs">
          03
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-lg bg-obsidian border border-border-atelier text-soft-gray flex items-center justify-center font-mono text-xs">
        {rank < 10 ? `0${rank}` : rank}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Card */}
      <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-border-atelier flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-graphite-light text-lime border border-border-atelier flex items-center justify-center">
            <Trophy className="w-6 h-6 text-lime" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-lime">
              ADVOCATE STANDINGS
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-warm-paper tracking-tight mt-0.5">
              Campus Ambassador Leaderboard
            </h2>
            <p className="text-xs text-soft-gray mt-0.5">
              Engineering students driving workshop registrations across colleges.
            </p>
          </div>
        </div>

        <button
          onClick={loadLeaderboard}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg bg-obsidian border border-border-atelier hover:border-lime text-warm-paper text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-3.5 bg-obsidian border border-tangerine text-tangerine text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-tangerine shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadLeaderboard} className="text-xs underline text-tangerine hover:text-warm-paper font-mono">
            RETRY
          </button>
        </div>
      )}

      {/* Leaderboard Table / Cards */}
      <div className="atelier-card rounded-2xl border border-border-atelier overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-soft-gray text-xs flex items-center justify-center space-x-2 font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-lime" />
            <span>RETRIEVING LEADERBOARD TELEMETRY...</span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center text-soft-gray text-xs px-4">
            <Users className="w-8 h-8 text-soft-gray mx-auto mb-2 opacity-50" />
            <p className="font-display font-bold text-warm-paper text-sm">No Verified Referrals Yet</p>
            <p className="text-[11px] text-soft-gray mt-1 max-w-sm mx-auto">
              Share your personal invite link to secure the #01 spot on the campus leaderboard.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-atelier">
            {leaderboard.map((item) => (
              <div
                key={item.rank}
                className={`p-4 sm:px-6 flex items-center justify-between transition ${
                  item.rank === 1
                    ? 'bg-graphite-light/60'
                    : 'hover:bg-graphite-light/30'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {getRankBadge(item.rank)}
                  <div>
                    <div className="font-display font-bold text-sm text-warm-paper flex items-center space-x-2">
                      <span>{item.display_name}</span>
                      {item.rank === 1 && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-lime text-obsidian uppercase">
                          TOP ADVOCATE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-soft-gray mt-0.5">{item.college}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-lime">
                    {item.verified_referrals}
                  </div>
                  <div className="text-[10px] font-mono text-soft-gray uppercase tracking-wider">
                    {item.verified_referrals === 1 ? 'Peer Confirmed' : 'Peers Confirmed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-soft-gray font-mono">
        Student identities are privacy-anonymized (e.g. R*** S***). Live rankings verify authentic registrations only.
      </p>
    </div>
  );
}
