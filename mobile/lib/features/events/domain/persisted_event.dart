class PersistedEvent {
  const PersistedEvent({
    required this.id,
    required this.title,
    required this.countryCode,
    required this.division,
    required this.startsAt,
    required this.status,
    required this.pathIds,
    this.description,
    this.city,
    this.venue,
    this.organizer,
    this.registrationUrl,
    this.endsAt,
  });

  factory PersistedEvent.fromJson(Map<String, dynamic> json) {
    final rawPaths = json['event_paths'];
    if (rawPaths is! List) {
      throw const FormatException('Event path payload is invalid.');
    }
    final pathIds = <String>[];
    for (final raw in rawPaths) {
      final row = _asJsonMap(raw);
      final pathId = row['path_id'];
      if (pathId is! String || pathId.isEmpty) {
        throw const FormatException('Event path identifier is invalid.');
      }
      pathIds.add(pathId);
    }

    return PersistedEvent(
      id: _requiredString(json, 'id'),
      title: _requiredNonEmptyString(json, 'title'),
      description: _optionalString(json, 'description'),
      countryCode: _requiredString(json, 'country_code'),
      division: _requiredString(json, 'division'),
      city: _optionalString(json, 'city'),
      venue: _optionalString(json, 'venue'),
      organizer: _optionalString(json, 'organizer'),
      registrationUrl: _optionalString(json, 'registration_url'),
      startsAt: _requiredDateTime(json, 'starts_at'),
      endsAt: _optionalDateTime(json, 'ends_at'),
      status: _requiredString(json, 'status'),
      pathIds: List.unmodifiable(pathIds),
    );
  }

  final String id;
  final String title;
  final String? description;
  final String countryCode;
  final String division;
  final String? city;
  final String? venue;
  final String? organizer;
  final String? registrationUrl;
  final DateTime startsAt;
  final DateTime? endsAt;
  final String status;
  final List<String> pathIds;
}

Map<String, dynamic> _asJsonMap(Object? value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map((key, entry) => MapEntry(key.toString(), entry));
  }
  throw const FormatException('Expected a JSON object.');
}

String _requiredString(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is! String) throw FormatException('Missing or invalid $key.');
  return value;
}

String _requiredNonEmptyString(Map<String, dynamic> json, String key) {
  final value = _requiredString(json, key).trim();
  if (value.isEmpty) throw FormatException('Missing or invalid $key.');
  return value;
}

String? _optionalString(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value == null) return null;
  if (value is! String) throw FormatException('Invalid $key.');
  return value;
}

DateTime _requiredDateTime(Map<String, dynamic> json, String key) {
  final value = _requiredString(json, key);
  final parsed = DateTime.tryParse(value);
  if (parsed == null) throw FormatException('Invalid $key.');
  return parsed;
}

DateTime? _optionalDateTime(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value == null) return null;
  if (value is! String) throw FormatException('Invalid $key.');
  final parsed = DateTime.tryParse(value);
  if (parsed == null) throw FormatException('Invalid $key.');
  return parsed;
}
