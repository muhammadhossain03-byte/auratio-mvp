import 'package:auratio_mobile/features/evaluations/domain/evaluation_method.dart';
import 'package:auratio_mobile/features/evaluations/domain/persisted_evaluation.dart';
import 'package:auratio_mobile/features/events/domain/persisted_event.dart';
import 'package:auratio_mobile/features/leaderboard/domain/leaderboard_models.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/progress/domain/progress_models.dart';
import 'package:auratio_mobile/features/tracks/domain/track_catalog.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-B1 canonical mobile/backend contract', () {
    test('all Paths use canonical persisted IDs', () {
      expect(AuratioPath.values.map((path) => path.wireValue).toList(), const [
        'public-speaking',
        'professional-presenting',
        'content-creation',
      ]);
      expect(
        AuratioPath.fromWire('professional-presenting'),
        AuratioPath.professionalPresenting,
      );
    });

    test('all 13 tracks use canonical backend IDs and duration gates', () {
      expect(AuratioTrackCatalog.allTracks, hasLength(13));
      expect(
        AuratioTrackCatalog.allTracks.map((track) => track.backendId).toList(),
        const [
          'informative',
          'extempore',
          'persuasive',
          'argumentative-debate',
          'explanatory',
          'news-delivery',
          'business-pitch',
          'general-presentation-multimedia',
          'academic-poster-project-thesis',
          'corporate-report',
          'infotainment-oriented',
          'academic-lecture-course',
          'marketing-promotional',
        ],
      );

      expect(
        AuratioTrackCatalog.businessPitch.slug,
        'business-pitch-sales-pitch',
      );
      expect(AuratioTrackCatalog.businessPitch.backendId, 'business-pitch');
      expect(
        AuratioTrackCatalog.findByBackendId('business-pitch'),
        same(AuratioTrackCatalog.businessPitch),
      );

      expect(AuratioTrackCatalog.informative.minDurationSeconds, 270);
      expect(AuratioTrackCatalog.informative.maxDurationSeconds, 450);
      expect(AuratioTrackCatalog.academicLecture.minDurationSeconds, 450);
      expect(AuratioTrackCatalog.academicLecture.maxDurationSeconds, 1230);
      expect(AuratioTrackCatalog.marketingPromotional.minDurationSeconds, 30);
      expect(AuratioTrackCatalog.marketingPromotional.maxDurationSeconds, 150);
      expect(
        AuratioTrackCatalog.businessPitch.acceptsDurationSeconds(150),
        isTrue,
      );
      expect(
        AuratioTrackCatalog.businessPitch.acceptsDurationSeconds(330),
        isTrue,
      );
      expect(
        AuratioTrackCatalog.businessPitch.acceptsDurationSeconds(149.9),
        isFalse,
      );
      expect(
        AuratioTrackCatalog.businessPitch.acceptsDurationSeconds(330.1),
        isFalse,
      );
    });

    test('evaluation-request command matches the Step VI-B Edge contract', () {
      const command = EvaluationRequestCommand(
        trackId: 'business-pitch',
        method: EvaluationMethod.ai,
        objectPath: '11111111-1111-1111-1111-111111111111/submission-1.mp4',
        durationSeconds: 252,
        sizeBytes: 2048,
      );

      expect(command.toFunctionBody(), {
        'track_id': 'business-pitch',
        'mode': 'ai',
        'object_path': '11111111-1111-1111-1111-111111111111/submission-1.mp4',
        'mime_type': 'video/mp4',
        'duration_seconds': 252.0,
        'size_bytes': 2048,
      });
    });

    test(
      'internal non-terminal request states remain user-facing Processing',
      () {
        const nonTerminal = [
          'unassigned',
          'assigned',
          'accepted',
          'in_evaluation',
          'processing',
          'submitted',
          'pending_moderation',
          'reopened',
        ];
        for (final value in nonTerminal) {
          expect(
            PersistedEvaluationStatus.fromWire(value).userStatus,
            UserEvaluationStatus.processing,
          );
        }
        expect(
          PersistedEvaluationStatus.fromWire('approved').userStatus,
          UserEvaluationStatus.approved,
        );
        expect(
          PersistedEvaluationStatus.fromWire('rejected').userStatus,
          UserEvaluationStatus.rejected,
        );
        expect(
          PersistedEvaluationStatus.fromWire('cancelled').userStatus,
          UserEvaluationStatus.cancelled,
        );
      },
    );

    test('evaluation request receipt parses the server response exactly', () {
      final receipt = EvaluationRequestReceipt.fromJson({
        'ok': true,
        'submission_id': 'submission-id',
        'request_id': 'request-id',
        'evaluation_version_id': 'version-id',
        'status': 'unassigned',
      });
      expect(receipt.submissionId, 'submission-id');
      expect(receipt.requestId, 'request-id');
      expect(receipt.evaluationVersionId, 'version-id');
      expect(receipt.status, PersistedEvaluationStatus.unassigned);
    });

    test('Approved evaluation parsers retain structured persisted data', () {
      final request = PersistedEvaluationRequest.fromRows(
        request: {
          'id': 'request-id',
          'submission_id': 'submission-id',
          'requested_mode': 'human',
          'mode': 'human',
          'status': 'approved',
          'created_at': '2026-09-07T10:00:00Z',
          'updated_at': '2026-09-07T10:10:00Z',
          'terminal_at': '2026-09-07T10:10:00Z',
        },
        submission: {
          'track_id': 'informative',
          'submitted_at': '2026-09-07T09:59:00Z',
        },
      );
      final version = ApprovedEvaluationVersion.fromJson({
        'id': 'version-id',
        'request_id': 'request-id',
        'version_number': 1,
        'status': 'approved',
        'overall_summary': 'Clear and actionable overall summary.',
        'universal_score': 32,
        'structural_score': 16,
        'track_score': 33,
        'final_score': 81,
        'approved_at': '2026-09-07T10:10:00Z',
      });
      final reference = EvaluationCriterionReference.fromJson({
        'id': 'pacing-wpm-pause-placement',
        'name': 'Pacing/WPM/pause placement',
        'category': 'universal_delivery',
        'max_points': 5,
        'position': 1,
      });
      final criterion = EvaluationCriterionResult.fromJson(
        json: {
          'criterion_id': 'pacing-wpm-pause-placement',
          'anchor': 'Competent',
          'score': 4,
          'primary_timestamp_seconds': 12.5,
          'evidence': 'The pace settles after the opening.',
          'strength': 'The middle section is controlled.',
          'weakness': 'The opening is slightly rushed.',
          'actionable_improvement': 'Pause once after the opening sentence.',
        },
        reference: reference,
      );
      final detail = ApprovedEvaluationDetail(
        request: request,
        version: version,
        criteria: [criterion],
      );

      expect(detail.request.requestedMethod, EvaluationMethod.human);
      expect(detail.request.method, EvaluationMethod.human);
      expect(detail.request.userStatus, UserEvaluationStatus.approved);
      expect(detail.version.finalScore, 81);
      expect(detail.criteria.single.maxPoints, 5);
      expect(detail.criteria.single.primaryTimestampSeconds, 12.5);
    });

    test('Approved report metadata preserves immutable storage identity', () {
      final report = ApprovedReportMetadata.fromJson({
        'id': 'report-id',
        'request_id': 'request-id',
        'evaluation_version_id': 'version-id',
        'bucket_name': 'evaluation-reports',
        'object_path': 'user/request/report.docx',
        'filename': 'Auratio_Informative_Human_Submission-ABC_v1.docx',
        'size_bytes': 4096,
        'generated_at': '2026-09-07T10:11:00Z',
      });
      expect(report.bucketName, 'evaluation-reports');
      expect(report.objectPath, 'user/request/report.docx');
      expect(report.sizeBytes, 4096);
    });

    test('private progress payload parses Approved-only mastery fields', () {
      final progress = UserProgressSnapshot.fromJson({
        'overall_mastery': 84.25,
        'represented_tracks': 1,
        'approved_evaluations': 4,
        'approved_ai': 3,
        'approved_human': 1,
        'tracks': [
          {
            'track_id': 'informative',
            'track_name': 'Informative',
            'approved_count': 4,
            'ai_count': 3,
            'human_count': 1,
            'track_mastery': 84.25,
            'latest_approved_at': '2026-09-07T11:00:00Z',
          },
        ],
      });
      expect(progress.overallMastery, 84.25);
      expect(progress.approvedEvaluations, 4);
      expect(progress.tracks.single.trackId, 'informative');
    });

    test('Approved history payload keeps mode, scores, and report state', () {
      final history = ApprovedHistoryPage.fromJson({
        'total': 1,
        'limit': 50,
        'offset': 0,
        'items': [
          {
            'submission_id': 'submission-id',
            'track_id': 'informative',
            'track_name': 'Informative',
            'mode': 'ai',
            'submission_date': '2026-09-07T09:00:00Z',
            'approved_at': '2026-09-07T09:05:00Z',
            'universal_score': 34,
            'structural_score': 17,
            'track_score': 35,
            'final_score': 86,
            'report_available': true,
          },
        ],
      });
      expect(history.total, 1);
      expect(history.items.single.method, EvaluationMethod.ai);
      expect(history.items.single.finalScore, 86);
      expect(history.items.single.reportAvailable, isTrue);
    });

    test('leaderboard query and response keep mode separation and period', () {
      final query = LeaderboardQuery(
        trackId: 'informative',
        method: EvaluationMethod.human,
        period: LeaderboardPeriod.monthly,
        month: DateTime.utc(2026, 9, 7),
      );
      expect(query.toFunctionBody(), {
        'track_id': 'informative',
        'mode': 'human',
        'period': 'monthly',
        'limit': 100,
        'month': '2026-09',
      });

      final board = LeaderboardSnapshot.fromJson({
        'track_id': 'informative',
        'mode': 'human',
        'period': 'monthly',
        'month': '2026-09',
        'rows': [
          {
            'rank': 1,
            'display_name': 'Speaker One',
            'avatar_url': null,
            'alr': 91.25,
            'alr_display': 91.3,
            'sform': 91.25,
            'activity_decay': 1.0,
            'participation_count': 4,
            'full_window_average': 91.25,
            'best_single_score': 95,
            'qualification_at': '2026-09-03T10:00:00Z',
            'latest_approved_at': '2026-09-07T10:00:00Z',
          },
        ],
        'current_user': {
          'qualified': false,
          'participation_count': 2,
          'rank': null,
          'alr': null,
          'alr_display': null,
          'sform': null,
          'activity_decay': null,
          'qualification_at': null,
        },
      });
      expect(board.method, EvaluationMethod.human);
      expect(board.period, LeaderboardPeriod.monthly);
      expect(board.rows.single.rank, 1);
      expect(board.currentUser.qualified, isFalse);
    });

    test('published Bangladesh event payload preserves multiple Path IDs', () {
      final event = PersistedEvent.fromJson({
        'id': 'event-id',
        'title': 'Dhaka Speakers Meetup',
        'description': 'A public speaking event.',
        'country_code': 'BD',
        'division': 'Dhaka',
        'city': 'Dhaka',
        'venue': 'Central venue',
        'organizer': 'Auratio',
        'registration_url': 'https://example.com/register',
        'starts_at': '2026-09-20T10:00:00+06:00',
        'ends_at': '2026-09-20T12:00:00+06:00',
        'status': 'published',
        'event_paths': [
          {'path_id': 'public-speaking'},
          {'path_id': 'professional-presenting'},
        ],
      });
      expect(event.countryCode, 'BD');
      expect(event.division, 'Dhaka');
      expect(event.pathIds, const [
        'public-speaking',
        'professional-presenting',
      ]);
    });
  });
}
