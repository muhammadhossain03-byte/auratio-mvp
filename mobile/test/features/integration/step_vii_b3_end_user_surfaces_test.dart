import 'dart:typed_data';

import 'package:auratio_mobile/features/evaluations/application/approved_evaluation_provider.dart';
import 'package:auratio_mobile/features/evaluations/application/evaluation_repository_provider.dart';
import 'package:auratio_mobile/features/evaluations/data/evaluation_repository.dart';
import 'package:auratio_mobile/features/evaluations/domain/evaluation_method.dart';
import 'package:auratio_mobile/features/evaluations/domain/persisted_evaluation.dart';
import 'package:auratio_mobile/features/events/application/events_data_provider.dart';
import 'package:auratio_mobile/features/events/application/events_repository_provider.dart';
import 'package:auratio_mobile/features/events/data/events_repository.dart';
import 'package:auratio_mobile/features/events/domain/persisted_event.dart';
import 'package:auratio_mobile/features/leaderboard/application/leaderboard_data_provider.dart';
import 'package:auratio_mobile/features/leaderboard/application/leaderboard_repository_provider.dart';
import 'package:auratio_mobile/features/leaderboard/data/leaderboard_repository.dart';
import 'package:auratio_mobile/features/leaderboard/domain/leaderboard_models.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/progress/application/progress_data_providers.dart';
import 'package:auratio_mobile/features/progress/application/progress_repository_provider.dart';
import 'package:auratio_mobile/features/progress/data/progress_repository.dart';
import 'package:auratio_mobile/features/progress/domain/progress_models.dart';
import 'package:auratio_mobile/features/tracks/domain/track_catalog.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-B3 persisted End-User surfaces', () {
    test(
      'Approved result provider can resolve a persisted submission',
      () async {
        final repository = _FakeEvaluationRepository();
        final container = ProviderContainer(
          overrides: [
            auratioEvaluationRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);

        final detail = await container.read(
          approvedEvaluationDetailProvider((
            requestId: null,
            submissionId: 'submission-1',
          )).future,
        );

        expect(detail?.request.id, 'request-1');
        expect(repository.requestedSubmissionId, 'submission-1');
      },
    );

    test(
      'Approved report provider uses immutable report service metadata',
      () async {
        final repository = _FakeEvaluationRepository();
        final container = ProviderContainer(
          overrides: [
            auratioEvaluationRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);

        final report = await container.read(
          approvedReportProvider((requestId: 'request-1', submissionId: null))
              .future,
        );

        expect(report?.filename, contains('Auratio_business-pitch_AI_'));
        expect(repository.ensuredReportRequestId, 'request-1');
      },
    );

    test(
      'private progress and Approved history use persisted repositories',
      () async {
        final repository = _FakeProgressRepository();
        final container = ProviderContainer(
          overrides: [
            auratioProgressRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);

        final progress = await container.read(userProgressProvider.future);
        final history = await container.read(approvedHistoryProvider.future);

        expect(progress.approvedEvaluations, 2);
        expect(history.total, 1);
        expect(repository.progressReads, 1);
        expect(repository.historyReads, 1);
      },
    );

    test(
      'leaderboard provider preserves canonical track/mode/period separation',
      () async {
        final repository = _FakeLeaderboardRepository();
        final container = ProviderContainer(
          overrides: [
            auratioLeaderboardRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);

        final snapshot = await container.read(
          leaderboardSnapshotProvider((
            trackId: 'business-pitch',
            method: EvaluationMethod.human,
            period: LeaderboardPeriod.monthly,
            month: DateTime(2026, 9),
          )).future,
        );

        expect(snapshot.trackId, 'business-pitch');
        expect(repository.track?.backendId, 'business-pitch');
        expect(repository.method, EvaluationMethod.human);
        expect(repository.period, LeaderboardPeriod.monthly);
        expect(repository.month, DateTime(2026, 9));
      },
    );

    test(
      'events providers preserve Division/Path/Date filters and event identity',
      () async {
        final repository = _FakeEventsRepository();
        final container = ProviderContainer(
          overrides: [
            auratioEventsRepositoryProvider.overrideWithValue(repository),
          ],
        );
        addTearDown(container.dispose);

        final events = await container.read(
          persistedEventsProvider((
            division: 'Dhaka Division',
            path: AuratioPath.publicSpeaking,
            upcomingOnly: true,
          )).future,
        );
        final event = await container.read(
          persistedEventProvider('event-1').future,
        );

        expect(events.single.countryCode, 'BD');
        expect(repository.division, 'Dhaka Division');
        expect(repository.path, AuratioPath.publicSpeaking);
        expect(repository.fromInclusive, isNotNull);
        expect(event?.id, 'event-1');
        expect(repository.eventId, 'event-1');
      },
    );
  });
}

class _FakeEvaluationRepository implements AuratioEvaluationRepository {
  String? requestedSubmissionId;
  String? ensuredReportRequestId;

  late final PersistedEvaluationRequest request = PersistedEvaluationRequest(
    id: 'request-1',
    submissionId: 'submission-1',
    trackId: 'business-pitch',
    method: EvaluationMethod.ai,
    status: PersistedEvaluationStatus.approved,
    createdAt: DateTime.utc(2026, 9, 7, 10),
    updatedAt: DateTime.utc(2026, 9, 7, 11),
    submittedAt: DateTime.utc(2026, 9, 7, 10),
    terminalAt: DateTime.utc(2026, 9, 7, 11),
  );

  late final ApprovedEvaluationDetail detail = ApprovedEvaluationDetail(
    request: request,
    version: ApprovedEvaluationVersion(
      id: 'version-1',
      requestId: 'request-1',
      versionNumber: 1,
      overallSummary: 'Persisted Approved summary.',
      universalScore: 35,
      structuralScore: 18,
      trackScore: 36,
      finalScore: 89,
      approvedAt: DateTime.utc(2026, 9, 7, 11),
    ),
    criteria: const [],
  );

  late final ApprovedReportMetadata report = ApprovedReportMetadata(
    id: 'report-1',
    requestId: 'request-1',
    evaluationVersionId: 'version-1',
    bucketName: 'evaluation-reports',
    objectPath: 'user-1/request-1/Auratio_business-pitch_AI_Submission-submission-1_v1.docx',
    filename: 'Auratio_business-pitch_AI_Submission-submission-1_v1.docx',
    generatedAt: DateTime.utc(2026, 9, 7, 11),
    sizeBytes: 4096,
  );

  @override
  bool get isConfigured => true;

  @override
  Future<PersistedEvaluationRequest?> fetchLatestRequest() async => request;

  @override
  Future<PersistedEvaluationRequest?> fetchActiveRequest() async => null;

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluation(
    String requestId,
  ) async {
    return requestId == request.id ? detail : null;
  }

  @override
  Future<ApprovedEvaluationDetail?> fetchApprovedEvaluationForSubmission(
    String submissionId,
  ) async {
    requestedSubmissionId = submissionId;
    return submissionId == request.submissionId ? detail : null;
  }

  @override
  Future<ApprovedReportMetadata?> fetchApprovedReport(String requestId) async {
    return requestId == request.id ? report : null;
  }

  @override
  Future<ApprovedReportMetadata?> ensureApprovedReport(String requestId) async {
    ensuredReportRequestId = requestId;
    return requestId == request.id ? report : null;
  }

  @override
  Future<Uint8List> downloadApprovedReport(
    ApprovedReportMetadata report,
  ) async {
    return Uint8List.fromList([1, 2, 3]);
  }

  @override
  Future<String> uploadVideoBytes({
    required String objectName,
    required Uint8List bytes,
  }) {
    throw UnsupportedError('Not used by B3 test.');
  }

  @override
  Future<EvaluationRequestReceipt> createEvaluationRequest({
    required TrackItem track,
    required EvaluationMethod method,
    required String objectPath,
    required double durationSeconds,
    required int sizeBytes,
  }) {
    throw UnsupportedError('Not used by B3 test.');
  }
}

class _FakeProgressRepository implements AuratioProgressRepository {
  int progressReads = 0;
  int historyReads = 0;

  @override
  bool get isConfigured => true;

  @override
  Future<UserProgressSnapshot> fetchProgress() async {
    progressReads++;
    return const UserProgressSnapshot(
      overallMastery: 86.5,
      representedTracks: 0,
      approvedEvaluations: 2,
      approvedAi: 1,
      approvedHuman: 1,
      tracks: [],
    );
  }

  @override
  Future<ApprovedHistoryPage> fetchApprovedHistory({
    int limit = 50,
    int offset = 0,
  }) async {
    historyReads++;
    return ApprovedHistoryPage(
      total: 1,
      limit: limit,
      offset: offset,
      items: [
        ApprovedHistoryItem(
          submissionId: 'submission-1',
          trackId: 'business-pitch',
          trackName: 'Business Pitch / Sales Pitch',
          method: EvaluationMethod.ai,
          submissionDate: DateTime.utc(2026, 9, 7, 10),
          approvedAt: DateTime.utc(2026, 9, 7, 11),
          universalScore: 35,
          structuralScore: 18,
          trackScore: 36,
          finalScore: 89,
          reportAvailable: true,
        ),
      ],
    );
  }
}

class _FakeLeaderboardRepository implements AuratioLeaderboardRepository {
  TrackItem? track;
  EvaluationMethod? method;
  LeaderboardPeriod? period;
  DateTime? month;

  @override
  bool get isConfigured => true;

  @override
  Future<LeaderboardSnapshot> fetchLeaderboard({
    required TrackItem track,
    required EvaluationMethod method,
    required LeaderboardPeriod period,
    DateTime? month,
    int limit = 100,
  }) async {
    this.track = track;
    this.method = method;
    this.period = period;
    this.month = month;
    return LeaderboardSnapshot(
      trackId: track.backendId,
      method: method,
      period: period,
      month: month == null
          ? null
          : '${month.year}-${month.month.toString().padLeft(2, '0')}',
      rows: const [],
      currentUser: const CurrentUserLeaderboardState(
        qualified: false,
        participationCount: 0,
      ),
    );
  }
}

class _FakeEventsRepository implements AuratioEventsRepository {
  String? division;
  AuratioPath? path;
  DateTime? fromInclusive;
  String? eventId;

  late final PersistedEvent event = PersistedEvent(
    id: 'event-1',
    title: 'Dhaka Speaking Forum',
    description: 'Persisted event.',
    countryCode: 'BD',
    division: 'Dhaka Division',
    city: 'Dhaka',
    venue: 'Auditorium',
    organizer: 'Auratio Community',
    registrationUrl: 'https://example.com/register',
    startsAt: DateTime.utc(2026, 10, 1, 12),
    endsAt: DateTime.utc(2026, 10, 1, 14),
    status: 'published',
    pathIds: const ['public-speaking'],
  );

  @override
  bool get isConfigured => true;

  @override
  Future<List<PersistedEvent>> fetchPublishedEvents({
    String? division,
    AuratioPath? path,
    DateTime? fromInclusive,
    DateTime? beforeExclusive,
  }) async {
    this.division = division;
    this.path = path;
    this.fromInclusive = fromInclusive;
    return [event];
  }

  @override
  Future<PersistedEvent?> fetchPublishedEvent(String eventId) async {
    this.eventId = eventId;
    return eventId == event.id ? event : null;
  }
}
