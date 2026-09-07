import 'package:supabase_flutter/supabase_flutter.dart';

import '../domain/progress_models.dart';

class AuratioProgressDataException implements Exception {
  const AuratioProgressDataException(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => 'AuratioProgressDataException($code): $message';
}

abstract interface class AuratioProgressRepository {
  bool get isConfigured;

  Future<UserProgressSnapshot> fetchProgress();

  Future<ApprovedHistoryPage> fetchApprovedHistory({
    int limit = 50,
    int offset = 0,
  });
}

class SupabaseAuratioProgressRepository implements AuratioProgressRepository {
  const SupabaseAuratioProgressRepository(this._client);

  final SupabaseClient _client;

  @override
  bool get isConfigured => true;

  @override
  Future<UserProgressSnapshot> fetchProgress() async {
    _requireUser();
    try {
      final data = await _client.rpc('get_my_progress');
      return UserProgressSnapshot.fromJson(_asJsonMap(data));
    } on FormatException {
      throw const AuratioProgressDataException(
        'invalid_progress_payload',
        'The persisted progress payload is invalid.',
      );
    } on PostgrestException {
      throw const AuratioProgressDataException(
        'progress_load_failed',
        'Unable to load progress.',
      );
    }
  }

  @override
  Future<ApprovedHistoryPage> fetchApprovedHistory({
    int limit = 50,
    int offset = 0,
  }) async {
    _requireUser();
    if (limit < 1 || limit > 100 || offset < 0) {
      throw const AuratioProgressDataException(
        'invalid_history_page',
        'Approved history paging values are invalid.',
      );
    }

    try {
      final data = await _client.rpc(
        'get_my_approved_history',
        params: {'p_limit': limit, 'p_offset': offset},
      );
      return ApprovedHistoryPage.fromJson(_asJsonMap(data));
    } on FormatException {
      throw const AuratioProgressDataException(
        'invalid_history_payload',
        'The persisted Approved history payload is invalid.',
      );
    } on PostgrestException {
      throw const AuratioProgressDataException(
        'history_load_failed',
        'Unable to load Approved history.',
      );
    }
  }

  void _requireUser() {
    if (_client.auth.currentUser == null) {
      throw const AuratioProgressDataException(
        'authentication_required',
        'Sign in before accessing progress.',
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

class UnconfiguredAuratioProgressRepository
    implements AuratioProgressRepository {
  const UnconfiguredAuratioProgressRepository();

  static const _error = AuratioProgressDataException(
    'integration_not_configured',
    'Auratio Supabase configuration is missing for this build.',
  );

  @override
  bool get isConfigured => false;

  @override
  Future<UserProgressSnapshot> fetchProgress() async => throw _error;

  @override
  Future<ApprovedHistoryPage> fetchApprovedHistory({
    int limit = 50,
    int offset = 0,
  }) async => throw _error;
}
