import 'package:supabase_flutter/supabase_flutter.dart';

import '../../onboarding/domain/auratio_path.dart';
import '../domain/persisted_event.dart';

class AuratioEventsDataException implements Exception {
  const AuratioEventsDataException(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => 'AuratioEventsDataException($code): $message';
}

abstract interface class AuratioEventsRepository {
  bool get isConfigured;

  Future<List<PersistedEvent>> fetchPublishedEvents({
    String? division,
    AuratioPath? path,
    DateTime? fromInclusive,
    DateTime? beforeExclusive,
  });

  Future<PersistedEvent?> fetchPublishedEvent(String eventId);
}

class SupabaseAuratioEventsRepository implements AuratioEventsRepository {
  const SupabaseAuratioEventsRepository(this._client);

  final SupabaseClient _client;

  @override
  bool get isConfigured => true;

  @override
  Future<PersistedEvent?> fetchPublishedEvent(String eventId) async {
    if (_client.auth.currentUser == null) {
      throw const AuratioEventsDataException(
        'authentication_required',
        'Sign in before accessing events.',
      );
    }

    final normalizedId = eventId.trim();
    if (normalizedId.isEmpty) {
      throw const AuratioEventsDataException(
        'invalid_event_id',
        'The event identifier is invalid.',
      );
    }

    const selection =
        'id,title,description,country_code,division,city,venue,organizer,'
        'registration_url,starts_at,ends_at,status,event_paths(path_id)';

    try {
      final row = await _client
          .from('events')
          .select(selection)
          .eq('id', normalizedId)
          .eq('status', 'published')
          .maybeSingle();
      if (row == null) return null;

      final event = PersistedEvent.fromJson(row);
      if (event.countryCode != 'BD' || event.status != 'published') {
        return null;
      }
      return event;
    } on FormatException {
      throw const AuratioEventsDataException(
        'invalid_event_payload',
        'The persisted event payload is invalid.',
      );
    } on PostgrestException {
      throw const AuratioEventsDataException(
        'event_load_failed',
        'Unable to load the event.',
      );
    }
  }

  @override
  Future<List<PersistedEvent>> fetchPublishedEvents({
    String? division,
    AuratioPath? path,
    DateTime? fromInclusive,
    DateTime? beforeExclusive,
  }) async {
    if (_client.auth.currentUser == null) {
      throw const AuratioEventsDataException(
        'authentication_required',
        'Sign in before accessing events.',
      );
    }
    if (fromInclusive != null &&
        beforeExclusive != null &&
        !fromInclusive.isBefore(beforeExclusive)) {
      throw const AuratioEventsDataException(
        'invalid_date_range',
        'Event date filters are invalid.',
      );
    }

    final pathSelection = path == null
        ? 'event_paths(path_id)'
        : 'event_paths!inner(path_id)';
    final selection =
        'id,title,description,country_code,division,city,venue,organizer,'
        'registration_url,starts_at,ends_at,status,$pathSelection';

    try {
      var query = _client
          .from('events')
          .select(selection)
          .eq('status', 'published');
      final normalizedDivision = division?.trim();
      if (normalizedDivision != null && normalizedDivision.isNotEmpty) {
        query = query.eq('division', normalizedDivision);
      }
      if (path != null) {
        query = query.eq('event_paths.path_id', path.wireValue);
      }
      if (fromInclusive != null) {
        query = query.gte('starts_at', fromInclusive.toUtc().toIso8601String());
      }
      if (beforeExclusive != null) {
        query = query.lt(
          'starts_at',
          beforeExclusive.toUtc().toIso8601String(),
        );
      }

      final rows = await query.order('starts_at');
      final events = rows
          .map((row) => PersistedEvent.fromJson(row))
          .where(
            (event) => event.countryCode == 'BD' && event.status == 'published',
          )
          .toList(growable: false);
      return List.unmodifiable(events);
    } on FormatException {
      throw const AuratioEventsDataException(
        'invalid_events_payload',
        'The persisted event directory payload is invalid.',
      );
    } on PostgrestException {
      throw const AuratioEventsDataException(
        'events_load_failed',
        'Unable to load events.',
      );
    }
  }
}

class UnconfiguredAuratioEventsRepository implements AuratioEventsRepository {
  const UnconfiguredAuratioEventsRepository();

  static const _error = AuratioEventsDataException(
    'integration_not_configured',
    'Auratio Supabase configuration is missing for this build.',
  );

  @override
  bool get isConfigured => false;

  @override
  Future<List<PersistedEvent>> fetchPublishedEvents({
    String? division,
    AuratioPath? path,
    DateTime? fromInclusive,
    DateTime? beforeExclusive,
  }) async => throw _error;

  @override
  Future<PersistedEvent?> fetchPublishedEvent(String eventId) async {
    throw _error;
  }
}
