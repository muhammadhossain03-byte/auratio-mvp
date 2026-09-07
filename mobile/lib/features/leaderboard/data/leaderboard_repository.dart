import 'package:supabase_flutter/supabase_flutter.dart';

import '../../evaluations/domain/evaluation_method.dart';
import '../../tracks/domain/track_catalog.dart';
import '../domain/leaderboard_models.dart';

class AuratioLeaderboardDataException implements Exception {
  const AuratioLeaderboardDataException(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => 'AuratioLeaderboardDataException($code): $message';
}

abstract interface class AuratioLeaderboardRepository {
  bool get isConfigured;

  Future<LeaderboardSnapshot> fetchLeaderboard({
    required TrackItem track,
    required EvaluationMethod method,
    required LeaderboardPeriod period,
    DateTime? month,
    int limit = 100,
  });
}

class SupabaseAuratioLeaderboardRepository
    implements AuratioLeaderboardRepository {
  const SupabaseAuratioLeaderboardRepository(this._client);

  final SupabaseClient _client;

  @override
  bool get isConfigured => true;

  @override
  Future<LeaderboardSnapshot> fetchLeaderboard({
    required TrackItem track,
    required EvaluationMethod method,
    required LeaderboardPeriod period,
    DateTime? month,
    int limit = 100,
  }) async {
    if (_client.auth.currentUser == null) {
      throw const AuratioLeaderboardDataException(
        'authentication_required',
        'Sign in before accessing the leaderboard.',
      );
    }
    if (limit < 1 || limit > 200) {
      throw const AuratioLeaderboardDataException(
        'invalid_limit',
        'Leaderboard limit must be between 1 and 200.',
      );
    }
    if (period == LeaderboardPeriod.allTime && month != null) {
      throw const AuratioLeaderboardDataException(
        'invalid_month',
        'A month can only be supplied for the Monthly leaderboard.',
      );
    }

    final query = LeaderboardQuery(
      trackId: track.backendId,
      method: method,
      period: period,
      month: month,
      limit: limit,
    );

    try {
      final response = await _client.functions.invoke(
        'leaderboard',
        body: query.toFunctionBody(),
      );
      return LeaderboardSnapshot.fromJson(_asJsonMap(response.data));
    } on FormatException {
      throw const AuratioLeaderboardDataException(
        'invalid_leaderboard_payload',
        'The leaderboard service returned an invalid payload.',
      );
    } catch (_) {
      throw const AuratioLeaderboardDataException(
        'leaderboard_load_failed',
        'Unable to load the leaderboard.',
      );
    }
  }

  static Map<String, dynamic> _asJsonMap(Object? value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((key, entry) => MapEntry(key.toString(), entry));
    }
    throw const FormatException('Expected a JSON object.');
  }
}

class UnconfiguredAuratioLeaderboardRepository
    implements AuratioLeaderboardRepository {
  const UnconfiguredAuratioLeaderboardRepository();

  static const _error = AuratioLeaderboardDataException(
    'integration_not_configured',
    'Auratio Supabase configuration is missing for this build.',
  );

  @override
  bool get isConfigured => false;

  @override
  Future<LeaderboardSnapshot> fetchLeaderboard({
    required TrackItem track,
    required EvaluationMethod method,
    required LeaderboardPeriod period,
    DateTime? month,
    int limit = 100,
  }) async => throw _error;
}
