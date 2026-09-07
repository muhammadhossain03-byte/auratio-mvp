import '../../evaluations/domain/evaluation_method.dart';

class TrackProgressSnapshot {
  const TrackProgressSnapshot({
    required this.trackId,
    required this.trackName,
    required this.approvedCount,
    required this.aiCount,
    required this.humanCount,
    required this.trackMastery,
    required this.latestApprovedAt,
  });

  factory TrackProgressSnapshot.fromJson(Map<String, dynamic> json) {
    return TrackProgressSnapshot(
      trackId: _requiredString(json, 'track_id'),
      trackName: _requiredNonEmptyString(json, 'track_name'),
      approvedCount: _requiredInt(json, 'approved_count'),
      aiCount: _requiredInt(json, 'ai_count'),
      humanCount: _requiredInt(json, 'human_count'),
      trackMastery: _requiredDouble(json, 'track_mastery'),
      latestApprovedAt: _requiredDateTime(json, 'latest_approved_at'),
    );
  }

  final String trackId;
  final String trackName;
  final int approvedCount;
  final int aiCount;
  final int humanCount;
  final double trackMastery;
  final DateTime latestApprovedAt;
}

class UserProgressSnapshot {
  const UserProgressSnapshot({
    required this.overallMastery,
    required this.representedTracks,
    required this.approvedEvaluations,
    required this.approvedAi,
    required this.approvedHuman,
    required this.tracks,
  });

  factory UserProgressSnapshot.fromJson(Map<String, dynamic> json) {
    final rawTracks = json['tracks'];
    if (rawTracks is! List) {
      throw const FormatException('Progress tracks payload is invalid.');
    }
    final tracks = rawTracks
        .map((item) => TrackProgressSnapshot.fromJson(_asJsonMap(item)))
        .toList(growable: false);

    final representedTracks = _requiredInt(json, 'represented_tracks');
    if (representedTracks != tracks.length) {
      throw const FormatException('Progress track count is inconsistent.');
    }

    return UserProgressSnapshot(
      overallMastery: _optionalDouble(json, 'overall_mastery'),
      representedTracks: representedTracks,
      approvedEvaluations: _requiredInt(json, 'approved_evaluations'),
      approvedAi: _requiredInt(json, 'approved_ai'),
      approvedHuman: _requiredInt(json, 'approved_human'),
      tracks: List.unmodifiable(tracks),
    );
  }

  final double? overallMastery;
  final int representedTracks;
  final int approvedEvaluations;
  final int approvedAi;
  final int approvedHuman;
  final List<TrackProgressSnapshot> tracks;
}

class ApprovedHistoryItem {
  const ApprovedHistoryItem({
    required this.submissionId,
    required this.trackId,
    required this.trackName,
    required this.method,
    required this.submissionDate,
    required this.approvedAt,
    required this.universalScore,
    required this.structuralScore,
    required this.trackScore,
    required this.finalScore,
    required this.reportAvailable,
  });

  factory ApprovedHistoryItem.fromJson(Map<String, dynamic> json) {
    return ApprovedHistoryItem(
      submissionId: _requiredString(json, 'submission_id'),
      trackId: _requiredString(json, 'track_id'),
      trackName: _requiredNonEmptyString(json, 'track_name'),
      method: EvaluationMethod.fromWire(_requiredString(json, 'mode')),
      submissionDate: _requiredDateTime(json, 'submission_date'),
      approvedAt: _requiredDateTime(json, 'approved_at'),
      universalScore: _requiredInt(json, 'universal_score'),
      structuralScore: _requiredInt(json, 'structural_score'),
      trackScore: _requiredInt(json, 'track_score'),
      finalScore: _requiredInt(json, 'final_score'),
      reportAvailable: _requiredBool(json, 'report_available'),
    );
  }

  final String submissionId;
  final String trackId;
  final String trackName;
  final EvaluationMethod method;
  final DateTime submissionDate;
  final DateTime approvedAt;
  final int universalScore;
  final int structuralScore;
  final int trackScore;
  final int finalScore;
  final bool reportAvailable;
}

class ApprovedHistoryPage {
  const ApprovedHistoryPage({
    required this.total,
    required this.limit,
    required this.offset,
    required this.items,
  });

  factory ApprovedHistoryPage.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    if (rawItems is! List) {
      throw const FormatException('Approved history items payload is invalid.');
    }
    return ApprovedHistoryPage(
      total: _requiredInt(json, 'total'),
      limit: _requiredInt(json, 'limit'),
      offset: _requiredInt(json, 'offset'),
      items: List.unmodifiable(
        rawItems.map((item) => ApprovedHistoryItem.fromJson(_asJsonMap(item))),
      ),
    );
  }

  final int total;
  final int limit;
  final int offset;
  final List<ApprovedHistoryItem> items;
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

int _requiredInt(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is int) return value;
  if (value is num && value == value.roundToDouble()) return value.toInt();
  throw FormatException('Missing or invalid $key.');
}

double _requiredDouble(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is num) return value.toDouble();
  throw FormatException('Missing or invalid $key.');
}

double? _optionalDouble(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value == null) return null;
  if (value is num) return value.toDouble();
  throw FormatException('Invalid $key.');
}

bool _requiredBool(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is bool) return value;
  throw FormatException('Missing or invalid $key.');
}

DateTime _requiredDateTime(Map<String, dynamic> json, String key) {
  final value = _requiredString(json, key);
  final parsed = DateTime.tryParse(value);
  if (parsed == null) throw FormatException('Invalid $key.');
  return parsed;
}
