import 'dart:typed_data';

import 'package:auratio_mobile/features/evaluations/application/evaluation_repository_provider.dart';
import 'package:auratio_mobile/features/evaluations/data/evaluation_repository.dart';
import 'package:auratio_mobile/features/evaluations/domain/evaluation_method.dart';
import 'package:auratio_mobile/features/evaluations/domain/persisted_evaluation.dart';
import 'package:auratio_mobile/features/submissions/application/recording_submission_controller.dart';
import 'package:auratio_mobile/features/submissions/data/mp4_duration_reader.dart';
import 'package:auratio_mobile/features/submissions/data/recording_file_picker.dart';
import 'package:auratio_mobile/features/tracks/domain/track_catalog.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-B2 MP4 duration reader', () {
    test('reads version-0 mvhd duration', () {
      final bytes = _buildMp4Version0(timescale: 1000, duration: 252000);

      expect(Mp4DurationReader.readDurationSeconds(bytes), 252.0);
    });

    test('reads version-1 mvhd duration', () {
      final bytes = _buildMp4Version1(timescale: 1000, duration: 1234000);

      expect(Mp4DurationReader.readDurationSeconds(bytes), 1234.0);
    });

    test('rejects a file without MP4 movie metadata', () {
      expect(
        () => Mp4DurationReader.readDurationSeconds(
          Uint8List.fromList(List<int>.filled(32, 0)),
        ),
        throwsFormatException,
      );
    });
  });

  group('Step VII-B2 persisted submission controller', () {
    test(
      'binds Business Pitch route selection to canonical backend request',
      () async {
        final bytes = _buildMp4Version0(timescale: 1000, duration: 252000);
        final picker = _FakePicker(
          PickedRecordingFile(name: 'Pitch Final.mp4', bytes: bytes),
        );
        final repository = _FakeEvaluationRepository();

        final container = ProviderContainer(
          overrides: [
            auratioRecordingPickerProvider.overrideWithValue(picker),
            auratioEvaluationRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);

        final controller = container.read(recordingSubmissionProvider.notifier);

        expect(await controller.chooseRecording(), isTrue);
        var state = container.read(recordingSubmissionProvider);
        expect(state.phase, RecordingSubmissionPhase.ready);
        expect(state.recording?.trackBackendId, 'business-pitch');
        expect(state.recording?.formattedDuration, '4:12');

        expect(await controller.uploadSelectedRecording(), isTrue);
        state = container.read(recordingSubmissionProvider);
        expect(state.phase, RecordingSubmissionPhase.uploaded);
        expect(state.recording?.isUploaded, isTrue);
        expect(state.recording?.bytes, isNull);
        expect(repository.uploadedObjectName, endsWith('.mp4'));

        final receipt = await controller.createEvaluationRequest(
          EvaluationMethod.ai,
        );
        expect(receipt, isNotNull);
        state = container.read(recordingSubmissionProvider);
        expect(state.phase, RecordingSubmissionPhase.requestCreated);
        expect(state.receipt?.status, PersistedEvaluationStatus.processing);
        expect(repository.requestTrack?.backendId, 'business-pitch');
        expect(repository.requestMethod, EvaluationMethod.ai);
        expect(repository.requestDuration, 252.0);
        expect(repository.requestSize, bytes.lengthInBytes);
      },
    );

    test(
      'rejects a locally measured duration outside the canonical gate',
      () async {
        final bytes = _buildMp4Version0(timescale: 1000, duration: 600000);
        final picker = _FakePicker(
          PickedRecordingFile(name: 'too-long.mp4', bytes: bytes),
        );
        final repository = _FakeEvaluationRepository();

        final container = ProviderContainer(
          overrides: [
            auratioRecordingPickerProvider.overrideWithValue(picker),
            auratioEvaluationRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);

        final success = await container
            .read(recordingSubmissionProvider.notifier)
            .chooseRecording();

        expect(success, isFalse);
        final state = container.read(recordingSubmissionProvider);
        expect(state.phase, RecordingSubmissionPhase.failed);
        expect(state.errorCode, 'duration_out_of_range');
        expect(repository.uploadedObjectName, isNull);
      },
    );
  });
}

class _FakePicker implements AuratioRecordingPicker {
  const _FakePicker(this.file);

  final PickedRecordingFile? file;

  @override
  Future<PickedRecordingFile?> pickMp4() async => file;
}

class _FakeEvaluationRepository implements AuratioEvaluationRepository {
  String? uploadedObjectName;
  TrackItem? requestTrack;
  EvaluationMethod? requestMethod;
  double? requestDuration;
  int? requestSize;

  @override
  bool get isConfigured => true;

  @override
  Future<String> uploadVideoBytes({
    required String objectName,
    required Uint8List bytes,
  }) async {
    uploadedObjectName = objectName;
    return 'user-id/$objectName';
  }

  @override
  Future<EvaluationRequestReceipt> createEvaluationRequest({
    required TrackItem track,
    required EvaluationMethod method,
    required String objectPath,
    required double durationSeconds,
    required int sizeBytes,
  }) async {
    requestTrack = track;
    requestMethod = method;
    requestDuration = durationSeconds;
    requestSize = sizeBytes;
    return const EvaluationRequestReceipt(
      submissionId: 'submission-id',
      requestId: 'request-id',
      evaluationVersionId: 'version-id',
      status: PersistedEvaluationStatus.processing,
    );
  }

  @override
  Future<PersistedEvaluationRequest?> fetchLatestRequest() async => null;

  @override
  Future<PersistedEvaluationRequest?> fetchActiveRequest() async => null;

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluation(
    String requestId,
  ) async {
    return null;
  }

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluationForSubmission(
    String submissionId,
  ) async {
    return null;
  }

  @override
  Future<ApprovedReportMetadata?> fetchApprovedReport(String requestId) async {
    return null;
  }

  @override
  Future<ApprovedReportMetadata?> ensureApprovedReport(String requestId) async {
    return null;
  }

  @override
  Future<Uint8List> downloadApprovedReport(
    ApprovedReportMetadata report,
  ) async {
    return Uint8List(0);
  }
}

Uint8List _buildMp4Version0({required int timescale, required int duration}) {
  final payload = Uint8List(20);
  final data = ByteData.sublistView(payload);
  data.setUint8(0, 0);
  data.setUint32(12, timescale, Endian.big);
  data.setUint32(16, duration, Endian.big);
  return _composeMp4(_box('mvhd', payload));
}

Uint8List _buildMp4Version1({required int timescale, required int duration}) {
  final payload = Uint8List(32);
  final data = ByteData.sublistView(payload);
  data.setUint8(0, 1);
  data.setUint32(20, timescale, Endian.big);
  data.setUint64(24, duration, Endian.big);
  return _composeMp4(_box('mvhd', payload));
}

Uint8List _composeMp4(Uint8List mvhd) {
  final ftypPayload = Uint8List.fromList([0x69, 0x73, 0x6f, 0x6d, 0, 0, 0, 1]);
  final ftyp = _box('ftyp', ftypPayload);
  final moov = _box('moov', mvhd);
  final output = Uint8List(ftyp.lengthInBytes + moov.lengthInBytes);
  output.setRange(0, ftyp.lengthInBytes, ftyp);
  output.setRange(ftyp.lengthInBytes, output.lengthInBytes, moov);
  return output;
}

Uint8List _box(String type, Uint8List payload) {
  final output = Uint8List(8 + payload.lengthInBytes);
  final data = ByteData.sublistView(output);
  data.setUint32(0, output.lengthInBytes, Endian.big);
  for (var index = 0; index < 4; index++) {
    output[4 + index] = type.codeUnitAt(index);
  }
  output.setRange(8, output.lengthInBytes, payload);
  return output;
}
