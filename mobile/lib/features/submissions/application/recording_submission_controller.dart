import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../evaluations/application/evaluation_repository_provider.dart';
import '../../evaluations/data/evaluation_repository.dart';
import '../../evaluations/domain/evaluation_method.dart';
import '../../evaluations/domain/persisted_evaluation.dart';
import '../../tracks/application/selected_track_provider.dart';
import '../../tracks/domain/track_catalog.dart';
import '../data/mp4_duration_reader.dart';
import '../data/recording_file_picker.dart';
import '../domain/selected_recording.dart';

enum RecordingSubmissionPhase {
  idle,
  picking,
  ready,
  uploading,
  uploaded,
  creatingRequest,
  requestCreated,
  failed,
}

class RecordingSubmissionState {
  const RecordingSubmissionState({
    this.phase = RecordingSubmissionPhase.idle,
    this.recording,
    this.receipt,
    this.errorCode,
    this.errorMessage,
  });

  final RecordingSubmissionPhase phase;
  final SelectedRecording? recording;
  final EvaluationRequestReceipt? receipt;
  final String? errorCode;
  final String? errorMessage;

  bool get isBusy =>
      phase == RecordingSubmissionPhase.picking ||
      phase == RecordingSubmissionPhase.uploading ||
      phase == RecordingSubmissionPhase.creatingRequest;

  bool get hasReadyBytes =>
      recording?.bytes != null &&
      recording!.bytes!.isNotEmpty &&
      !recording!.isUploaded;

  bool get hasUploadedRecording => recording?.isUploaded ?? false;
}

final auratioRecordingPickerProvider = Provider<AuratioRecordingPicker>((ref) {
  return const FilePickerAuratioRecordingPicker();
});

final recordingSubmissionProvider =
    NotifierProvider<RecordingSubmissionController, RecordingSubmissionState>(
      RecordingSubmissionController.new,
    );

class RecordingSubmissionController extends Notifier<RecordingSubmissionState> {
  @override
  RecordingSubmissionState build() => const RecordingSubmissionState();

  Future<bool> chooseRecording() async {
    final previous = state.recording;
    state = RecordingSubmissionState(
      phase: RecordingSubmissionPhase.picking,
      recording: previous,
    );

    try {
      final picked = await ref.read(auratioRecordingPickerProvider).pickMp4();
      if (picked == null) {
        state = previous == null
            ? const RecordingSubmissionState()
            : RecordingSubmissionState(
                phase: previous.isUploaded
                    ? RecordingSubmissionPhase.uploaded
                    : RecordingSubmissionPhase.ready,
                recording: previous,
              );
        return false;
      }

      final normalizedName = picked.name.trim();
      if (normalizedName.isEmpty ||
          !normalizedName.toLowerCase().endsWith('.mp4')) {
        return _fail(
          code: 'invalid_video_name',
          message: 'Choose a single .mp4 recording.',
        );
      }
      if (picked.sizeBytes <= 0) {
        return _fail(
          code: 'empty_video',
          message: 'The selected recording is empty.',
        );
      }

      final durationSeconds = Mp4DurationReader.readDurationSeconds(
        picked.bytes,
      );
      final track = ref.read(selectedTrackProvider);
      if (!track.acceptsDurationSeconds(durationSeconds)) {
        return _fail(
          code: 'duration_out_of_range',
          message:
              'The recording must be within ${track.acceptedDuration} for ${track.name}.',
        );
      }

      state = RecordingSubmissionState(
        phase: RecordingSubmissionPhase.ready,
        recording: SelectedRecording(
          name: normalizedName,
          sizeBytes: picked.sizeBytes,
          durationSeconds: durationSeconds,
          trackBackendId: track.backendId,
          bytes: picked.bytes,
        ),
      );
      return true;
    } on FormatException {
      return _fail(
        code: 'invalid_mp4',
        message: 'Auratio could not read valid MP4 duration metadata from this file.',
      );
    } catch (_) {
      return _fail(
        code: 'recording_selection_failed',
        message: 'Unable to read the selected recording.',
      );
    }
  }

  Future<bool> uploadSelectedRecording() async {
    final recording = state.recording;
    if (recording == null) {
      return _fail(
        code: 'recording_required',
        message: 'Choose a valid recording before continuing.',
      );
    }
    if (recording.isUploaded) {
      state = RecordingSubmissionState(
        phase: RecordingSubmissionPhase.uploaded,
        recording: recording,
      );
      return true;
    }

    final bytes = recording.bytes;
    if (bytes == null || bytes.isEmpty) {
      return _fail(
        code: 'recording_bytes_unavailable',
        message: 'Choose the recording again before uploading.',
        recording: recording,
      );
    }

    final track = AuratioTrackCatalog.findByBackendId(recording.trackBackendId);
    if (track == null) {
      return _fail(
        code: 'unknown_track',
        message: 'The selected track is no longer available.',
        recording: recording,
      );
    }
    if (!track.acceptsDurationSeconds(recording.durationSeconds)) {
      return _fail(
        code: 'duration_out_of_range',
        message:
            'The recording must be within ${track.acceptedDuration} for ${track.name}.',
        recording: recording,
      );
    }

    state = RecordingSubmissionPhase.uploading == state.phase
        ? state
        : RecordingSubmissionState(
            phase: RecordingSubmissionPhase.uploading,
            recording: recording,
          );

    try {
      final objectName = _buildObjectName(recording.name);
      final objectPath = await ref
          .read(auratioEvaluationRepositoryProvider)
          .uploadVideoBytes(objectName: objectName, bytes: bytes);

      state = RecordingSubmissionState(
        phase: RecordingSubmissionPhase.uploaded,
        recording: recording.withUploadedObjectPath(objectPath),
      );
      return true;
    } on AuratioEvaluationDataException catch (error) {
      return _fail(
        code: error.code,
        message: _dataErrorMessage(error),
        recording: recording,
      );
    } catch (_) {
      return _fail(
        code: 'video_upload_failed',
        message: 'Unable to upload the recording.',
        recording: recording,
      );
    }
  }

  Future<EvaluationRequestReceipt?> createEvaluationRequest(
    EvaluationMethod method,
  ) async {
    if (state.receipt != null) {
      return state.receipt;
    }

    final recording = state.recording;
    if (recording == null || !recording.isUploaded) {
      _fail(
        code: 'uploaded_recording_required',
        message: 'Upload an eligible recording before choosing an evaluator.',
        recording: recording,
      );
      return null;
    }

    final track = AuratioTrackCatalog.findByBackendId(recording.trackBackendId);
    if (track == null) {
      _fail(
        code: 'unknown_track',
        message: 'The selected track is no longer available.',
        recording: recording,
      );
      return null;
    }

    state = RecordingSubmissionState(
      phase: RecordingSubmissionPhase.creatingRequest,
      recording: recording,
    );

    try {
      final receipt = await ref
          .read(auratioEvaluationRepositoryProvider)
          .createEvaluationRequest(
            track: track,
            method: method,
            objectPath: recording.objectPath!,
            durationSeconds: recording.durationSeconds,
            sizeBytes: recording.sizeBytes,
          );

      state = RecordingSubmissionState(
        phase: RecordingSubmissionPhase.requestCreated,
        recording: recording,
        receipt: receipt,
      );
      return receipt;
    } on AuratioEvaluationDataException catch (error) {
      _fail(
        code: error.code,
        message: _dataErrorMessage(error),
        recording: recording,
      );
      return null;
    } catch (_) {
      _fail(
        code: 'evaluation_request_failed',
        message: 'Unable to create the evaluation request.',
        recording: recording,
      );
      return null;
    }
  }

  void reset() {
    state = const RecordingSubmissionState();
  }

  bool _fail({
    required String code,
    required String message,
    SelectedRecording? recording,
  }) {
    state = RecordingSubmissionState(
      phase: RecordingSubmissionPhase.failed,
      recording: recording,
      errorCode: code,
      errorMessage: message,
    );
    return false;
  }

  static String _dataErrorMessage(AuratioEvaluationDataException error) {
    switch (error.code) {
      case 'active_request_exists':
        return 'You already have an active evaluation. Open its status instead of creating another.';
      case 'duration_out_of_range':
      case 'invalid_video_duration':
      case 'invalid_video_size':
      case 'invalid_video_name':
      case 'invalid_video_path':
      case 'empty_video':
        return error.message;
      case 'integration_not_configured':
        return 'Auratio is not connected to the evaluation service in this build.';
      case 'video_upload_failed':
        return 'Unable to upload the recording.';
      case 'evaluation_request_rejected':
        return 'The evaluation request could not be accepted.';
      default:
        return 'Unable to complete this evaluation step.';
    }
  }

  static String _buildObjectName(String originalName) {
    final base = originalName.length > 4
        ? originalName.substring(0, originalName.length - 4)
        : 'recording';
    var safeBase = base
        .replaceAll(RegExp(r'[^A-Za-z0-9._-]+'), '-')
        .replaceAll(RegExp(r'-+'), '-')
        .replaceAll(RegExp(r'^[-.]+|[-.]+$'), '');

    if (safeBase.isEmpty) {
      safeBase = 'recording';
    }
    if (safeBase.length > 60) {
      safeBase = safeBase.substring(0, 60);
    }

    final stamp = DateTime.now().toUtc().microsecondsSinceEpoch;
    return '${safeBase}_$stamp.mp4';
  }
}
