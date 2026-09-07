import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../foundation/integration/auratio_supabase.dart';
import '../data/leaderboard_repository.dart';

final auratioLeaderboardRepositoryProvider =
    Provider<AuratioLeaderboardRepository>((ref) {
      final client = AuratioSupabase.client;
      if (client == null) {
        return const UnconfiguredAuratioLeaderboardRepository();
      }
      return SupabaseAuratioLeaderboardRepository(client);
    });
