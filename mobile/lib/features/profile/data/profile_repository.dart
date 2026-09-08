import 'package:supabase_flutter/supabase_flutter.dart';

import '../../onboarding/domain/auratio_path.dart';

class AuratioProfileDataException implements Exception {
  const AuratioProfileDataException(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => 'AuratioProfileDataException($code): $message';
}

class PersistedEndUserProfile {
  const PersistedEndUserProfile({
    required this.userId,
    required this.email,
    required this.displayName,
    required this.paths,
    this.avatarUrl,
  });

  final String userId;
  final String email;
  final String displayName;
  final String? avatarUrl;
  final Set<AuratioPath> paths;

  String get initials {
    final words = displayName
        .trim()
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();
    if (words.isEmpty) return 'AU';
    if (words.length == 1) {
      final word = words.first;
      return word.substring(0, word.length >= 2 ? 2 : 1).toUpperCase();
    }
    return '${words.first[0]}${words.last[0]}'.toUpperCase();
  }
}

abstract interface class AuratioProfileRepository {
  bool get isConfigured;

  Future<PersistedEndUserProfile> fetchProfile();

  Future<Set<AuratioPath>> fetchPaths();

  Future<void> replacePaths(Set<AuratioPath> paths);

  Future<void> updateDisplayName(String displayName);
}

class SupabaseAuratioProfileRepository implements AuratioProfileRepository {
  const SupabaseAuratioProfileRepository(this._client);

  final SupabaseClient _client;

  @override
  bool get isConfigured => true;

  User _requireUser() {
    final user = _client.auth.currentUser;
    if (user == null) {
      throw const AuratioProfileDataException(
        'profile_session_missing',
        'Your Auratio session is no longer available.',
      );
    }
    return user;
  }

  @override
  Future<PersistedEndUserProfile> fetchProfile() async {
    final user = _requireUser();
    try {
      final profile = await _client
          .from('profiles')
          .select('user_id,display_name,avatar_url,role,account_status')
          .eq('user_id', user.id)
          .maybeSingle();

      if (profile == null) {
        throw const AuratioProfileDataException(
          'profile_missing',
          'Your Auratio profile is not available.',
        );
      }
      if (profile['role'] != 'end_user' ||
          profile['account_status'] != 'active') {
        throw const AuratioProfileDataException(
          'profile_access_denied',
          'This account cannot use the Auratio mobile profile.',
        );
      }

      final displayName = (profile['display_name'] as String?)?.trim() ?? '';
      if (displayName.isEmpty) {
        throw const AuratioProfileDataException(
          'profile_invalid',
          'Your Auratio profile is incomplete.',
        );
      }

      return PersistedEndUserProfile(
        userId: user.id,
        email: user.email ?? '',
        displayName: displayName,
        avatarUrl: profile['avatar_url'] as String?,
        paths: await fetchPaths(),
      );
    } on AuratioProfileDataException {
      rethrow;
    } on PostgrestException {
      throw const AuratioProfileDataException(
        'profile_load_failed',
        'Unable to load your Auratio profile.',
      );
    } on FormatException {
      throw const AuratioProfileDataException(
        'profile_paths_invalid',
        'Your saved Auratio Paths are invalid.',
      );
    }
  }

  @override
  Future<Set<AuratioPath>> fetchPaths() async {
    final user = _requireUser();
    try {
      final rows = await _client
          .from('user_paths')
          .select('path_id')
          .eq('user_id', user.id)
          .order('selected_at');

      final paths = <AuratioPath>{};
      for (final row in rows) {
        final pathId = row['path_id'];
        if (pathId is! String) {
          throw const FormatException('Missing path_id');
        }
        paths.add(AuratioPath.fromWire(pathId));
      }
      return Set.unmodifiable(paths);
    } on AuratioProfileDataException {
      rethrow;
    } on PostgrestException {
      throw const AuratioProfileDataException(
        'profile_paths_load_failed',
        'Unable to load your selected Auratio Paths.',
      );
    } on FormatException {
      throw const AuratioProfileDataException(
        'profile_paths_invalid',
        'Your saved Auratio Paths are invalid.',
      );
    }
  }

  @override
  Future<void> replacePaths(Set<AuratioPath> paths) async {
    if (paths.isEmpty) {
      throw const AuratioProfileDataException(
        'profile_paths_empty',
        'Select at least one Auratio Path.',
      );
    }

    final user = _requireUser();
    final desired = Set<AuratioPath>.from(paths);
    final current = await fetchPaths();

    try {
      // Add first, then remove. A persisted user never passes through an empty
      // Path set while changing selections.
      for (final path in desired.difference(current)) {
        await _client.from('user_paths').insert({
          'user_id': user.id,
          'path_id': path.wireValue,
        });
      }

      for (final path in current.difference(desired)) {
        await _client
            .from('user_paths')
            .delete()
            .eq('user_id', user.id)
            .eq('path_id', path.wireValue);
      }
    } on PostgrestException {
      throw const AuratioProfileDataException(
        'profile_paths_save_failed',
        'Unable to save your selected Auratio Paths.',
      );
    }
  }

  @override
  Future<void> updateDisplayName(String displayName) async {
    final normalized = displayName.trim();
    if (normalized.length < 2 || normalized.length > 80) {
      throw const AuratioProfileDataException(
        'profile_display_name_invalid',
        'Display name must be between 2 and 80 characters.',
      );
    }

    final user = _requireUser();
    try {
      await _client
          .from('profiles')
          .update({'display_name': normalized})
          .eq('user_id', user.id);
    } on PostgrestException {
      throw const AuratioProfileDataException(
        'profile_update_failed',
        'Unable to update your Auratio profile.',
      );
    }
  }
}

class UnconfiguredAuratioProfileRepository implements AuratioProfileRepository {
  const UnconfiguredAuratioProfileRepository();

  static const _error = AuratioProfileDataException(
    'integration_not_configured',
    'Auratio Supabase configuration is missing for this build.',
  );

  @override
  bool get isConfigured => false;

  @override
  Future<PersistedEndUserProfile> fetchProfile() async => throw _error;

  @override
  Future<Set<AuratioPath>> fetchPaths() async => throw _error;

  @override
  Future<void> replacePaths(Set<AuratioPath> paths) async => throw _error;

  @override
  Future<void> updateDisplayName(String displayName) async => throw _error;
}
