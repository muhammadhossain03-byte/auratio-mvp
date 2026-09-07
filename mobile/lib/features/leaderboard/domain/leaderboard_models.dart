import '../../evaluations/domain/evaluation_method.dart';

enum LeaderboardPeriod {
  allTime('all_time'),
  monthly('monthly');

  const LeaderboardPeriod(this.wireValue);

  final String wireValue;

  static LeaderboardPeriod fromWire(String value) {
    return values.firstWhere(
      (period) => period.wireValue == value,
      orElse: () => throw FormatException('Unknown leaderboard period: $value'),
    );
  }
}

class LeaderboardQuery {
  const LeaderboardQuery({
    required this.trackId,
    required this.method,
    required this.period,
    this.month,
    this.limit = 100,
  });

  final String trackId;
  final EvaluationMethod method;
  final LeaderboardPeriod period;
  final DateTime? month;
  final int limit;

  Map<String, Object> toFunctionBody() {
    final result = <String, Object>{
      'track_id': trackId,
      'mode': method.wireValue,
      'period': period.wireValue,
      'limit': limit,
    };
    if (month != null) {
      final value = month!;
      result['month'] =
          '${value.year.toString().padLeft(4, '0')}-${value.month.toString().padLeft(2, '0')}';
    }
    return result;
  }
}

class LeaderboardEntry {
  const LeaderboardEntry({
    required this.rank,
    required this.displayName,
    required this.alr,
    required this.alrDisplay,
    required this.sform,
    required this.activityDecay,
    required this.participationCount,
    required this.fullWindowAverage,
    required this.bestSingleScore,
    required this.qualificationAt,
    required this.latestApprovedAt,
    this.avatarUrl,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: _requiredInt(json, 'rank'),
      displayName: _requiredNonEmptyString(json, 'display_name'),
      avatarUrl: _optionalString(json, 'avatar_url'),
      alr: _requiredDouble(json, 'alr'),
      alrDisplay: _requiredDouble(json, 'alr_display'),
      sform: _requiredDouble(json, 'sform'),
      activityDecay: _requiredDouble(json, 'activity_decay'),
      participationCount: _requiredInt(json, 'participation_count'),
      fullWindowAverage: _requiredDouble(json, 'full_window_average'),
      bestSingleScore: _requiredDouble(json, 'best_single_score'),
      qualificationAt: _requiredDateTime(json, 'qualification_at'),
      latestApprovedAt: _requiredDateTime(json, 'latest_approved_at'),
    );
  }

  final int rank;
  final String displayName;
  final String? avatarUrl;
  final double alr;
  final double alrDisplay;
  final double sform;
  final double activityDecay;
  final int participationCount;
  final double fullWindowAverage;
  final double bestSingleScore;
  final DateTime qualificationAt;
  final DateTime latestApprovedAt;
}

class CurrentUserLeaderboardState {
  const CurrentUserLeaderboardState({
    required this.qualified,
    required this.participationCount,
    this.rank,
    this.alr,
    this.alrDisplay,
    this.sform,
    this.activityDecay,
    this.qualificationAt,
  });

  factory CurrentUserLeaderboardState.fromJson(Map<String, dynamic> json) {
    final qualified = _requiredBool(json, 'qualified');
    return CurrentUserLeaderboardState(
      qualified: qualified,
      participationCount: _requiredInt(json, 'participation_count'),
      rank: _optionalInt(json, 'rank'),
      alr: _optionalDouble(json, 'alr'),
      alrDisplay: _optionalDouble(json, 'alr_display'),
      sform: _optionalDouble(json, 'sform'),
      activityDecay: _optionalDouble(json, 'activity_decay'),
      qualificationAt: _optionalDateTime(json, 'qualification_at'),
    );
  }

  final bool qualified;
  final int participationCount;
  final int? rank;
  final double? alr;
  final double? alrDisplay;
  final double? sform;
  final double? activityDecay;
  final DateTime? qualificationAt;
}

class LeaderboardSnapshot {
  const LeaderboardSnapshot({
    required this.trackId,
    required this.method,
    required this.period,
    required this.rows,
    required this.currentUser,
    this.month,
  });

  factory LeaderboardSnapshot.fromJson(Map<String, dynamic> json) {
    final rawRows = json['rows'];
    if (rawRows is! List) {
      throw const FormatException('Leaderboard rows payload is invalid.');
    }
    final currentUser = json['current_user'];
    return LeaderboardSnapshot(
      trackId: _requiredString(json, 'track_id'),
      method: EvaluationMethod.fromWire(_requiredString(json, 'mode')),
      period: LeaderboardPeriod.fromWire(_requiredString(json, 'period')),
      month: _optionalString(json, 'month'),
      rows: List.unmodifiable(
        rawRows.map((item) => LeaderboardEntry.fromJson(_asJsonMap(item))),
      ),
      currentUser: CurrentUserLeaderboardState.fromJson(
        _asJsonMap(currentUser),
      ),
    );
  }

  final String trackId;
  final EvaluationMethod method;
  final LeaderboardPeriod period;
  final String? month;
  final List<LeaderboardEntry> rows;
  final CurrentUserLeaderboardState currentUser;
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

int _requiredInt(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is int) return value;
  if (value is num && value == value.roundToDouble()) return value.toInt();
  throw FormatException('Missing or invalid $key.');
}

int? _optionalInt(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value == null) return null;
  if (value is int) return value;
  if (value is num && value == value.roundToDouble()) return value.toInt();
  throw FormatException('Invalid $key.');
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

DateTime? _optionalDateTime(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value == null) return null;
  if (value is! String) throw FormatException('Invalid $key.');
  final parsed = DateTime.tryParse(value);
  if (parsed == null) throw FormatException('Invalid $key.');
  return parsed;
}
