import 'evaluation_method.dart';

enum PersistedEvaluationStatus {
  unassigned('unassigned'),
  assigned('assigned'),
  accepted('accepted'),
  inEvaluation('in_evaluation'),
  processing('processing'),
  submitted('submitted'),
  pendingModeration('pending_moderation'),
  reopened('reopened'),
  approved('approved'),
  rejected('rejected'),
  cancelled('cancelled');

  const PersistedEvaluationStatus(this.wireValue);

  final String wireValue;

  bool get isTerminal =>
      this == PersistedEvaluationStatus.approved ||
      this == PersistedEvaluationStatus.rejected ||
      this == PersistedEvaluationStatus.cancelled;

  UserEvaluationStatus get userStatus {
    switch (this) {
      case PersistedEvaluationStatus.approved:
        return UserEvaluationStatus.approved;
      case PersistedEvaluationStatus.rejected:
        return UserEvaluationStatus.rejected;
      case PersistedEvaluationStatus.cancelled:
        return UserEvaluationStatus.cancelled;
      case PersistedEvaluationStatus.unassigned:
      case PersistedEvaluationStatus.assigned:
      case PersistedEvaluationStatus.accepted:
      case PersistedEvaluationStatus.inEvaluation:
      case PersistedEvaluationStatus.processing:
      case PersistedEvaluationStatus.submitted:
      case PersistedEvaluationStatus.pendingModeration:
      case PersistedEvaluationStatus.reopened:
        return UserEvaluationStatus.processing;
    }
  }

  static PersistedEvaluationStatus fromWire(String value) {
    return values.firstWhere(
      (status) => status.wireValue == value,
      orElse: () =>
          throw FormatException('Unknown evaluation request status: $value'),
    );
  }
}

enum UserEvaluationStatus { processing, approved, rejected, cancelled }

class PersistedEvaluationRequest {
  const PersistedEvaluationRequest({
    required this.id,
    required this.submissionId,
    required this.trackId,
    required this.method,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.submittedAt,
    this.terminalAt,
  });

  factory PersistedEvaluationRequest.fromRows({
    required Map<String, dynamic> request,
    required Map<String, dynamic> submission,
  }) {
    return PersistedEvaluationRequest(
      id: _requiredString(request, 'id'),
      submissionId: _requiredString(request, 'submission_id'),
      trackId: _requiredString(submission, 'track_id'),
      method: EvaluationMethod.fromWire(_requiredString(request, 'mode')),
      status: PersistedEvaluationStatus.fromWire(
        _requiredString(request, 'status'),
      ),
      createdAt: _requiredDateTime(request, 'created_at'),
      updatedAt: _requiredDateTime(request, 'updated_at'),
      submittedAt: _requiredDateTime(submission, 'submitted_at'),
      terminalAt: _optionalDateTime(request, 'terminal_at'),
    );
  }

  final String id;
  final String submissionId;
  final String trackId;
  final EvaluationMethod method;
  final PersistedEvaluationStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime submittedAt;
  final DateTime? terminalAt;

  UserEvaluationStatus get userStatus => status.userStatus;
}

class EvaluationRequestCommand {
  const EvaluationRequestCommand({
    required this.trackId,
    required this.method,
    required this.objectPath,
    required this.durationSeconds,
    required this.sizeBytes,
  });

  final String trackId;
  final EvaluationMethod method;
  final String objectPath;
  final double durationSeconds;
  final int sizeBytes;

  Map<String, Object> toFunctionBody() => {
    'track_id': trackId,
    'mode': method.wireValue,
    'object_path': objectPath,
    'mime_type': 'video/mp4',
    'duration_seconds': durationSeconds,
    'size_bytes': sizeBytes,
  };
}

class EvaluationRequestReceipt {
  const EvaluationRequestReceipt({
    required this.submissionId,
    required this.requestId,
    required this.evaluationVersionId,
    required this.status,
  });

  factory EvaluationRequestReceipt.fromJson(Map<String, dynamic> json) {
    final ok = json['ok'];
    if (ok is! bool || !ok) {
      throw const FormatException('Evaluation request response is not usable.');
    }
    return EvaluationRequestReceipt(
      submissionId: _requiredString(json, 'submission_id'),
      requestId: _requiredString(json, 'request_id'),
      evaluationVersionId: _requiredString(json, 'evaluation_version_id'),
      status: PersistedEvaluationStatus.fromWire(
        _requiredString(json, 'status'),
      ),
    );
  }

  final String submissionId;
  final String requestId;
  final String evaluationVersionId;
  final PersistedEvaluationStatus status;
}

class ApprovedEvaluationVersion {
  const ApprovedEvaluationVersion({
    required this.id,
    required this.requestId,
    required this.versionNumber,
    required this.overallSummary,
    required this.universalScore,
    required this.structuralScore,
    required this.trackScore,
    required this.finalScore,
    required this.approvedAt,
  });

  factory ApprovedEvaluationVersion.fromJson(Map<String, dynamic> json) {
    if (_requiredString(json, 'status') != 'approved') {
      throw const FormatException('Evaluation version is not Approved.');
    }
    return ApprovedEvaluationVersion(
      id: _requiredString(json, 'id'),
      requestId: _requiredString(json, 'request_id'),
      versionNumber: _requiredInt(json, 'version_number'),
      overallSummary: _requiredNonEmptyString(json, 'overall_summary'),
      universalScore: _requiredInt(json, 'universal_score'),
      structuralScore: _requiredInt(json, 'structural_score'),
      trackScore: _requiredInt(json, 'track_score'),
      finalScore: _requiredInt(json, 'final_score'),
      approvedAt: _requiredDateTime(json, 'approved_at'),
    );
  }

  final String id;
  final String requestId;
  final int versionNumber;
  final String overallSummary;
  final int universalScore;
  final int structuralScore;
  final int trackScore;
  final int finalScore;
  final DateTime approvedAt;
}

class EvaluationCriterionReference {
  const EvaluationCriterionReference({
    required this.id,
    required this.name,
    required this.category,
    required this.maxPoints,
    required this.position,
  });

  factory EvaluationCriterionReference.fromJson(Map<String, dynamic> json) {
    return EvaluationCriterionReference(
      id: _requiredString(json, 'id'),
      name: _requiredNonEmptyString(json, 'name'),
      category: _requiredString(json, 'category'),
      maxPoints: _requiredInt(json, 'max_points'),
      position: _requiredInt(json, 'position'),
    );
  }

  final String id;
  final String name;
  final String category;
  final int maxPoints;
  final int position;

  int get categorySortOrder {
    switch (category) {
      case 'universal_delivery':
        return 0;
      case 'structural_flow':
        return 1;
      case 'track_specialisation':
        return 2;
      default:
        throw FormatException('Unknown criterion category: $category');
    }
  }
}

class EvaluationCriterionResult {
  const EvaluationCriterionResult({
    required this.criterionId,
    required this.criterionName,
    required this.category,
    required this.maxPoints,
    required this.position,
    required this.anchor,
    required this.score,
    required this.primaryTimestampSeconds,
    required this.evidence,
    required this.strength,
    required this.weakness,
    required this.actionableImprovement,
  });

  factory EvaluationCriterionResult.fromJson({
    required Map<String, dynamic> json,
    required EvaluationCriterionReference reference,
  }) {
    final criterionId = _requiredString(json, 'criterion_id');
    if (criterionId != reference.id) {
      throw const FormatException('Criterion result/reference mismatch.');
    }
    return EvaluationCriterionResult(
      criterionId: criterionId,
      criterionName: reference.name,
      category: reference.category,
      maxPoints: reference.maxPoints,
      position: reference.position,
      anchor: _requiredString(json, 'anchor'),
      score: _requiredInt(json, 'score'),
      primaryTimestampSeconds: _requiredDouble(
        json,
        'primary_timestamp_seconds',
      ),
      evidence: _requiredNonEmptyString(json, 'evidence'),
      strength: _requiredNonEmptyString(json, 'strength'),
      weakness: _requiredNonEmptyString(json, 'weakness'),
      actionableImprovement: _requiredNonEmptyString(
        json,
        'actionable_improvement',
      ),
    );
  }

  final String criterionId;
  final String criterionName;
  final String category;
  final int maxPoints;
  final int position;
  final String anchor;
  final int score;
  final double primaryTimestampSeconds;
  final String evidence;
  final String strength;
  final String weakness;
  final String actionableImprovement;
}

class ApprovedEvaluationDetail {
  const ApprovedEvaluationDetail({
    required this.request,
    required this.version,
    required this.criteria,
  });

  final PersistedEvaluationRequest request;
  final ApprovedEvaluationVersion version;
  final List<EvaluationCriterionResult> criteria;
}

class ApprovedReportMetadata {
  const ApprovedReportMetadata({
    required this.id,
    required this.requestId,
    required this.evaluationVersionId,
    required this.bucketName,
    required this.objectPath,
    required this.filename,
    required this.generatedAt,
    this.sizeBytes,
  });

  factory ApprovedReportMetadata.fromJson(Map<String, dynamic> json) {
    return ApprovedReportMetadata(
      id: _requiredString(json, 'id'),
      requestId: _requiredString(json, 'request_id'),
      evaluationVersionId: _requiredString(json, 'evaluation_version_id'),
      bucketName: _requiredString(json, 'bucket_name'),
      objectPath: _requiredNonEmptyString(json, 'object_path'),
      filename: _requiredNonEmptyString(json, 'filename'),
      sizeBytes: _optionalInt(json, 'size_bytes'),
      generatedAt: _requiredDateTime(json, 'generated_at'),
    );
  }

  final String id;
  final String requestId;
  final String evaluationVersionId;
  final String bucketName;
  final String objectPath;
  final String filename;
  final int? sizeBytes;
  final DateTime generatedAt;
}

String _requiredString(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is! String) {
    throw FormatException('Missing or invalid $key.');
  }
  return value;
}

String _requiredNonEmptyString(Map<String, dynamic> json, String key) {
  final value = _requiredString(json, key).trim();
  if (value.isEmpty) {
    throw FormatException('Missing or invalid $key.');
  }
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
