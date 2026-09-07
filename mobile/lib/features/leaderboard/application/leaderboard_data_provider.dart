import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../evaluations/domain/evaluation_method.dart';
import '../../tracks/domain/track_catalog.dart';
import '../domain/leaderboard_models.dart';
import 'leaderboard_repository_provider.dart';

typedef LeaderboardViewQuery = ({
  String trackId,
  EvaluationMethod method,
  LeaderboardPeriod period,
  DateTime? month,
});

final leaderboardSnapshotProvider =
    FutureProvider.family<LeaderboardSnapshot, LeaderboardViewQuery>((
      ref,
      query,
    ) {
      final track = AuratioTrackCatalog.findByBackendId(query.trackId);
      if (track == null) {
        throw StateError('Unknown leaderboard track: ');
      }
      return ref
          .watch(auratioLeaderboardRepositoryProvider)
          .fetchLeaderboard(
            track: track,
            method: query.method,
            period: query.period,
            month: query.month,
          );
    });
