import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../../tracks/domain/track_catalog.dart';
import '../domain/evaluation_method.dart';
import '../domain/persisted_evaluation.dart';

class AuratioEvaluationDataException implements Exception {
  const AuratioEvaluationDataException(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => 'AuratioEvaluationDataException($code): $message';
}

abstract interface class AuratioEvaluationRepository {
  bool get isConfigured;

  Future<PersistedEvaluationRequest?> fetchLatestRequest();

  Future<PersistedEvaluationRequest?> fetchActiveRequest();

  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluationForSubmission(
    String submissionId,
  );

  Future<String> uploadVideoBytes({
    required String objectName,
    required Uint8List bytes,
  });

  Future<EvaluationRequestReceipt> createEvaluationRequest({
    required TrackItem track,
    required EvaluationMethod method,
    required String objectPath,
    required double durationSeconds,
    required int sizeBytes,
  });

  Future<PersistedEvaluationRequest> consentAiToHuman(String requestId);

  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluation(String requestId);

  Future<ApprovedReportMetadata?> fetchApprovedReport(String requestId);

  Future<ApprovedReportMetadata?> ensureApprovedReport(String requestId);

  Future<Uint8List> downloadApprovedReport(ApprovedReportMetadata report);
}

class SupabaseAuratioEvaluationRepository
    implements AuratioEvaluationRepository {
  const SupabaseAuratioEvaluationRepository(this._client);

  static const _videoBucket = 'evaluation-videos';
  static const _reportBucket = 'evaluation-reports';

  final SupabaseClient _client;

  @override
  bool get isConfigured => true;

  @override
  Future<PersistedEvaluationRequest?> fetchLatestRequest() async {
    return _fetchRequest(activeOnly: false);
  }

  @override
  Future<PersistedEvaluationRequest?> fetchActiveRequest() async {
    return _fetchRequest(activeOnly: true);
  }

  @override
  Future<String> uploadVideoBytes({
    required String objectName,
    required Uint8List bytes,
  }) async {
    final userId = _requireUserId();
    final normalizedName = objectName.trim();
    if (!_isValidObjectName(normalizedName)) {
      throw const AuratioEvaluationDataException(
        'invalid_video_name',
        'The upload must use a single .mp4 file name.',
      );
    }
    if (bytes.isEmpty) {
      throw const AuratioEvaluationDataException(
        'empty_video',
        'The selected video is empty.',
      );
    }

    final active = await fetchActiveRequest();
    if (active != null) {
      throw const AuratioEvaluationDataException(
        'active_request_exists',
        'Finish or terminate the active evaluation before starting another.',
      );
    }

    final objectPath = '$userId/$normalizedName';
    try {
      await _client.storage
          .from(_videoBucket)
          .uploadBinary(
            objectPath,
            bytes,
            fileOptions: const FileOptions(
              contentType: 'video/mp4',
              upsert: false,
            ),
          );
      return objectPath;
    } catch (_) {
      throw const AuratioEvaluationDataException(
        'video_upload_failed',
        'Unable to upload the video.',
      );
    }
  }

  @override
  Future<EvaluationRequestReceipt> createEvaluationRequest({
    required TrackItem track,
    required EvaluationMethod method,
    required String objectPath,
    required double durationSeconds,
    required int sizeBytes,
  }) async {
    final userId = _requireUserId();
    final normalizedPath = objectPath.trim();
    if (!normalizedPath.startsWith('$userId/') ||
        !normalizedPath.toLowerCase().endsWith('.mp4')) {
      throw const AuratioEvaluationDataException(
        'invalid_video_path',
        'The uploaded video path is not valid for this account.',
      );
    }
    if (sizeBytes <= 0) {
      throw const AuratioEvaluationDataException(
        'invalid_video_size',
        'The selected video size is invalid.',
      );
    }
    if (!durationSeconds.isFinite || durationSeconds <= 0) {
      throw const AuratioEvaluationDataException(
        'invalid_video_duration',
        'The selected video duration is invalid.',
      );
    }
    if (!track.acceptsDurationSeconds(durationSeconds)) {
      throw AuratioEvaluationDataException(
        'duration_out_of_range',
        'The video must be within ${track.acceptedDuration} for ${track.name}.',
      );
    }

    final command = EvaluationRequestCommand(
      trackId: track.backendId,
      method: method,
      objectPath: normalizedPath,
      durationSeconds: durationSeconds,
      sizeBytes: sizeBytes,
    );

    try {
      final response = await _client.functions.invoke(
        'evaluation-request',
        body: command.toFunctionBody(),
      );
      return EvaluationRequestReceipt.fromJson(_asJsonMap(response.data));
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_request_response',
        'The evaluation service returned an invalid response.',
      );
    } on FunctionsHttpException catch (error) {
      if (error.status == 409) {
        throw const AuratioEvaluationDataException(
          'active_request_exists',
          'An active evaluation request already exists.',
        );
      }
      if (error.status >= 400 && error.status < 500) {
        throw const AuratioEvaluationDataException(
          'evaluation_request_rejected',
          'The evaluation request was rejected.',
        );
      }
      throw const AuratioEvaluationDataException(
        'evaluation_request_failed',
        'Unable to create the evaluation request.',
      );
    } catch (_) {
      throw const AuratioEvaluationDataException(
        'evaluation_request_failed',
        'Unable to create the evaluation request.',
      );
    }
  }

  @override
  Future<PersistedEvaluationRequest> consentAiToHuman(String requestId) async {
    final normalizedRequestId = requestId.trim();
    if (normalizedRequestId.isEmpty) {
      throw const AuratioEvaluationDataException(
        'invalid_request_id',
        'The evaluation request identifier is invalid.',
      );
    }

    try {
      final response = await _client.functions.invoke(
        'evaluation-request',
        body: {
          'action': 'consent_ai_to_human',
          'request_id': normalizedRequestId,
        },
      );
      final payload = _asJsonMap(response.data);
      if (payload['ok'] != true ||
          payload['request_id'] != normalizedRequestId ||
          payload['requested_mode'] != 'ai' ||
          payload['mode'] != 'human' ||
          payload['status'] != 'unassigned') {
        throw const FormatException(
          'AI to Human redirect response is inconsistent.',
        );
      }

      final refreshed = await _fetchRequestById(normalizedRequestId);
      if (refreshed == null ||
          !refreshed.wasRedirectedAiToHuman ||
          refreshed.status != PersistedEvaluationStatus.unassigned) {
        throw const FormatException(
          'Redirected evaluation request did not persist coherently.',
        );
      }
      return refreshed;
    } on AuratioEvaluationDataException {
      rethrow;
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_mode_redirection_response',
        'Auratio could not verify the Human redirect. The current route was not changed by the app.',
      );
    } on FunctionsHttpException catch (error) {
      if (error.status == 409) {
        throw const AuratioEvaluationDataException(
          'mode_redirection_rejected',
          'This AI request can no longer be switched to Human. The AI route remains unchanged.',
        );
      }
      throw const AuratioEvaluationDataException(
        'mode_redirection_failed',
        'Unable to switch this request to Human. The AI route remains unchanged.',
      );
    } catch (_) {
      throw const AuratioEvaluationDataException(
        'mode_redirection_failed',
        'Unable to switch this request to Human. The AI route remains unchanged.',
      );
    }
  }

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluationForSubmission(
    String submissionId,
  ) async {
    final userId = _requireUserId();
    final normalizedSubmissionId = submissionId.trim();
    if (normalizedSubmissionId.isEmpty) {
      throw const AuratioEvaluationDataException(
        'invalid_submission_id',
        'The Approved submission identifier is invalid.',
      );
    }

    try {
      final row = await _client
          .from('evaluation_requests')
          .select('id')
          .eq('submission_id', normalizedSubmissionId)
          .eq('user_id', userId)
          .eq('status', 'approved')
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();
      if (row == null) return null;

      final requestId = row['id'];
      if (requestId is! String || requestId.isEmpty) {
        throw const FormatException(
          'Approved evaluation request identifier is invalid.',
        );
      }
      return await fetchApprovedEvaluation(requestId);
    } on AuratioEvaluationDataException {
      rethrow;
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_approved_evaluation',
        'The persisted Approved evaluation is incomplete or invalid.',
      );
    } on PostgrestException {
      throw const AuratioEvaluationDataException(
        'approved_evaluation_load_failed',
        'Unable to load the Approved evaluation.',
      );
    }
  }

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluation(
    String requestId,
  ) async {
    final request = await _fetchRequestById(requestId);
    if (request == null ||
        request.status != PersistedEvaluationStatus.approved) {
      return null;
    }

    try {
      final versionRow = await _client
          .from('evaluation_versions')
          .select(
            'id,request_id,version_number,status,overall_summary,'
            'universal_score,structural_score,track_score,final_score,approved_at',
          )
          .eq('request_id', requestId)
          .eq('status', 'approved')
          .order('version_number', ascending: false)
          .limit(1)
          .maybeSingle();
      if (versionRow == null) return null;

      final version = ApprovedEvaluationVersion.fromJson(versionRow);
      final criterionRows = await _client
          .from('evaluation_criterion_results')
          .select(
            'evaluation_version_id,criterion_id,anchor,score,'
            'primary_timestamp_seconds,evidence,strength,weakness,'
            'actionable_improvement',
          )
          .eq('evaluation_version_id', version.id);
      final referenceRows = await _client
          .from('criteria')
          .select('id,name,category,max_points,position');

      final references = <String, EvaluationCriterionReference>{};
      for (final raw in referenceRows) {
        final reference = EvaluationCriterionReference.fromJson(raw);
        references[reference.id] = reference;
      }

      final criteria = <EvaluationCriterionResult>[];
      for (final raw in criterionRows) {
        final criterionId = raw['criterion_id'];
        if (criterionId is! String) {
          throw const FormatException('Criterion result has no criterion ID.');
        }
        final reference = references[criterionId];
        if (reference == null) {
          throw FormatException('Unknown criterion reference: $criterionId');
        }
        criteria.add(
          EvaluationCriterionResult.fromJson(json: raw, reference: reference),
        );
      }
      if (criteria.length != 16) {
        throw FormatException(
          'Approved evaluation must contain exactly 16 criteria; '
          'received ${criteria.length}.',
        );
      }
      criteria.sort((left, right) {
        final categoryOrder = left.category == right.category
            ? 0
            : _categoryOrder(left.category)
                  .compareTo(_categoryOrder(right.category));
        if (categoryOrder != 0) return categoryOrder;
        return left.position.compareTo(right.position);
      });

      return ApprovedEvaluationDetail(
        request: request,
        version: version,
        criteria: List.unmodifiable(criteria),
      );
    } on AuratioEvaluationDataException {
      rethrow;
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_approved_evaluation',
        'The persisted Approved evaluation is incomplete or invalid.',
      );
    } on PostgrestException {
      throw const AuratioEvaluationDataException(
        'approved_evaluation_load_failed',
        'Unable to load the Approved evaluation.',
      );
    }
  }

  @override
  Future<ApprovedReportMetadata?> fetchApprovedReport(String requestId) async {
    final request = await _fetchRequestById(requestId);
    if (request == null ||
        request.status != PersistedEvaluationStatus.approved) {
      return null;
    }

    try {
      final row = await _client
          .from('reports')
          .select(
            'id,request_id,evaluation_version_id,bucket_name,object_path,'
            'filename,size_bytes,generated_at',
          )
          .eq('request_id', requestId)
          .maybeSingle();
      if (row == null) return null;
      final report = ApprovedReportMetadata.fromJson(row);
      if (report.bucketName != _reportBucket) {
        throw const FormatException('Unexpected report bucket.');
      }
      return report;
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_report_metadata',
        'The persisted report metadata is invalid.',
      );
    } on PostgrestException {
      throw const AuratioEvaluationDataException(
        'report_metadata_load_failed',
        'Unable to load the Approved report metadata.',
      );
    }
  }

  @override
  Future<ApprovedReportMetadata?> ensureApprovedReport(String requestId) async {
    final request = await _fetchRequestById(requestId);
    if (request == null ||
        request.status != PersistedEvaluationStatus.approved) {
      return null;
    }

    final existing = await fetchApprovedReport(requestId);
    if (existing != null) {
      return existing;
    }

    try {
      final response = await _client.functions.invoke(
        'report',
        body: {'request_id': requestId},
      );
      final payload = _asJsonMap(response.data);
      final state = payload['state'];
      if (state != 'ready' && state != 'in_progress') {
        throw const FormatException('Unexpected report-service state.');
      }

      final rawReport = payload['report'];
      if (rawReport != null) {
        final report = ApprovedReportMetadata.fromJson(_asJsonMap(rawReport));
        if (report.bucketName != _reportBucket ||
            report.requestId != requestId) {
          throw const FormatException('Unexpected report metadata.');
        }
        return report;
      }

      return await fetchApprovedReport(requestId);
    } on AuratioEvaluationDataException {
      rethrow;
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_report_service_response',
        'The report service returned an invalid response.',
      );
    } on FunctionsHttpException {
      throw const AuratioEvaluationDataException(
        'report_generation_failed',
        'Unable to prepare the Approved report.',
      );
    } catch (_) {
      throw const AuratioEvaluationDataException(
        'report_generation_failed',
        'Unable to prepare the Approved report.',
      );
    }
  }

  @override
  Future<Uint8List> downloadApprovedReport(
    ApprovedReportMetadata report,
  ) async {
    if (report.bucketName != _reportBucket) {
      throw const AuratioEvaluationDataException(
        'invalid_report_bucket',
        'The report metadata does not reference the Approved report bucket.',
      );
    }
    try {
      return await _client.storage
          .from(report.bucketName)
          .download(report.objectPath);
    } catch (_) {
      throw const AuratioEvaluationDataException(
        'report_download_failed',
        'Unable to download the Approved report.',
      );
    }
  }

  Future<PersistedEvaluationRequest?> _fetchRequest({
    required bool activeOnly,
  }) async {
    final userId = _requireUserId();
    try {
      final rows = await _client
          .from('evaluation_requests')
          .select(
            'id,submission_id,requested_mode,mode,status,created_at,updated_at,terminal_at',
          )
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(50);

      for (final row in rows) {
        final statusRaw = row['status'];
        if (statusRaw is! String) {
          throw const FormatException('Evaluation request status is missing.');
        }
        final status = PersistedEvaluationStatus.fromWire(statusRaw);
        if (!activeOnly || !status.isTerminal) {
          return await _hydrateRequest(row);
        }
      }
      return null;
    } on AuratioEvaluationDataException {
      rethrow;
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_request_payload',
        'The persisted evaluation request is invalid.',
      );
    } on PostgrestException {
      throw const AuratioEvaluationDataException(
        'request_load_failed',
        'Unable to load the evaluation request.',
      );
    }
  }

  Future<PersistedEvaluationRequest?> _fetchRequestById(
    String requestId,
  ) async {
    final userId = _requireUserId();
    try {
      final row = await _client
          .from('evaluation_requests')
          .select(
            'id,submission_id,requested_mode,mode,status,created_at,updated_at,terminal_at',
          )
          .eq('id', requestId)
          .eq('user_id', userId)
          .maybeSingle();
      if (row == null) return null;
      return await _hydrateRequest(row);
    } on AuratioEvaluationDataException {
      rethrow;
    } on FormatException {
      throw const AuratioEvaluationDataException(
        'invalid_request_payload',
        'The persisted evaluation request is invalid.',
      );
    } on PostgrestException {
      throw const AuratioEvaluationDataException(
        'request_load_failed',
        'Unable to load the evaluation request.',
      );
    }
  }

  Future<PersistedEvaluationRequest> _hydrateRequest(
    Map<String, dynamic> request,
  ) async {
    final submissionId = request['submission_id'];
    if (submissionId is! String) {
      throw const FormatException(
        'Evaluation request submission ID is missing.',
      );
    }
    final submission = await _client
        .from('submissions')
        .select('id,track_id,submitted_at')
        .eq('id', submissionId)
        .maybeSingle();
    if (submission == null) {
      throw const FormatException('Evaluation request submission is missing.');
    }
    return PersistedEvaluationRequest.fromRows(
      request: request,
      submission: submission,
    );
  }

  String _requireUserId() {
    final userId = _client.auth.currentUser?.id;
    if (userId == null || userId.isEmpty) {
      throw const AuratioEvaluationDataException(
        'authentication_required',
        'Sign in before accessing persisted evaluation data.',
      );
    }
    return userId;
  }

  static bool _isValidObjectName(String value) {
    if (value.isEmpty || value.contains('/') || value.contains('\\')) {
      return false;
    }
    return value.toLowerCase().endsWith('.mp4');
  }

  static int _categoryOrder(String category) {
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

  static Map<String, dynamic> _asJsonMap(Object? value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((key, entry) => MapEntry(key.toString(), entry));
    }
    throw const FormatException('Expected a JSON object.');
  }
}

class UnconfiguredAuratioEvaluationRepository
    implements AuratioEvaluationRepository {
  const UnconfiguredAuratioEvaluationRepository();

  static const _error = AuratioEvaluationDataException(
    'integration_not_configured',
    'Auratio Supabase configuration is missing for this build.',
  );

  @override
  bool get isConfigured => false;

  @override
  Future<PersistedEvaluationRequest?> fetchLatestRequest() async => null;

  @override
  Future<PersistedEvaluationRequest?> fetchActiveRequest() async => null;

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluationForSubmission(
    String submissionId,
  ) async {
    throw _error;
  }

  @override
  Future<String> uploadVideoBytes({
    required String objectName,
    required Uint8List bytes,
  }) async {
    throw _error;
  }

  @override
  Future<EvaluationRequestReceipt> createEvaluationRequest({
    required TrackItem track,
    required EvaluationMethod method,
    required String objectPath,
    required double durationSeconds,
    required int sizeBytes,
  }) async {
    throw _error;
  }

  @override
  Future<PersistedEvaluationRequest> consentAiToHuman(String requestId) async {
    throw _error;
  }

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluation(
    String requestId,
  ) async {
    throw _error;
  }

  @override
  Future<ApprovedReportMetadata?> fetchApprovedReport(String requestId) async {
    throw _error;
  }

  @override
  Future<ApprovedReportMetadata?> ensureApprovedReport(String requestId) async {
    throw _error;
  }

  @override
  Future<Uint8List> downloadApprovedReport(
    ApprovedReportMetadata report,
  ) async {
    throw _error;
  }
}
