import 'package:flutter_riverpod/flutter_riverpod.dart';

enum LeaderboardPeriod { allTime, monthly }

class LeaderboardPeriodNotifier extends Notifier<LeaderboardPeriod> {
  @override
  LeaderboardPeriod build() => LeaderboardPeriod.allTime;

  void setPeriod(LeaderboardPeriod period) {
    state = period;
  }
}

final leaderboardPeriodProvider =
    NotifierProvider<LeaderboardPeriodNotifier, LeaderboardPeriod>(
      LeaderboardPeriodNotifier.new,
    );
