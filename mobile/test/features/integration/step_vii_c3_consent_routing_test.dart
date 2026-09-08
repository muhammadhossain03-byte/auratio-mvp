import 'package:auratio_mobile/features/evaluations/application/evaluation_repository_provider.dart';
import 'package:auratio_mobile/features/evaluations/data/evaluation_repository.dart';
import 'package:auratio_mobile/features/evaluations/domain/evaluation_method.dart';
import 'package:auratio_mobile/features/evaluations/domain/persisted_evaluation.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_processing_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-C3 explicit AI to Human consent routing', () {
    test('persisted request preserves requested mode separately from effective route', () {
      final request = PersistedEvaluationRequest.fromRows(
        request: {
          'id': 'request-1',
          'submission_id': 'submission-1',
          'requested_mode': 'ai',
          'mode': 'human',
          'status': 'unassigned',
          'created_at': '2026-09-08T10:00:00Z',
          'updated_at': '2026-09-08T10:01:00Z',
          'terminal_at': null,
        },
        submission: {
          'track_id': 'business-pitch',
          'submitted_at': '2026-09-08T09:59:00Z',
        },
      );

      expect(request.requestedMethod, EvaluationMethod.ai);
      expect(request.method, EvaluationMethod.human);
      expect(request.wasRedirectedAiToHuman, isTrue);
      expect(request.canConsentAiToHuman, isFalse);
      expect(request.userStatus, UserEvaluationStatus.processing);
    });

    testWidgets('Human redirect requires an explicit positive confirmation', (
      tester,
    ) async {
      final repository = _ConsentFakeRepository();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            auratioEvaluationRepositoryProvider.overrideWithValue(repository),
          ],
          child: const MaterialApp(
            home: EvaluationProcessingScreen(method: EvaluationMethod.ai),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
        findsOneWidget,
      );
      expect(repository.consentCalls, 0);

      await tester.ensureVisible(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
      );
      await tester.pumpAndSettle();

      expect(
        find.byKey(EvaluationProcessingScreen.redirectKeepAiButtonKey),
        findsOneWidget,
      );
      expect(
        find.byKey(EvaluationProcessingScreen.redirectConfirmButtonKey),
        findsOneWidget,
      );
      expect(repository.consentCalls, 0);

      await tester.tap(
        find.byKey(EvaluationProcessingScreen.redirectKeepAiButtonKey),
      );
      await tester.pumpAndSettle();
      expect(repository.consentCalls, 0);
      expect(repository.request.method, EvaluationMethod.ai);

      await tester.ensureVisible(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(EvaluationProcessingScreen.redirectConfirmButtonKey),
      );
      await tester.pumpAndSettle();

      expect(repository.consentCalls, 1);
      expect(repository.request.requestedMethod, EvaluationMethod.ai);
      expect(repository.request.method, EvaluationMethod.human);
      expect(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
        findsNothing,
      );
      expect(find.text('AI → Human consent recorded'), findsOneWidget);
      expect(find.textContaining('Current route: Human'), findsOneWidget);
    });

    testWidgets('a rejected redirect leaves the persisted AI route unchanged', (
      tester,
    ) async {
      final repository = _ConsentFakeRepository(rejectRedirect: true);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            auratioEvaluationRepositoryProvider.overrideWithValue(repository),
          ],
          child: const MaterialApp(
            home: EvaluationProcessingScreen(method: EvaluationMethod.ai),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.ensureVisible(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(EvaluationProcessingScreen.redirectConfirmButtonKey),
      );
      await tester.pumpAndSettle();

      expect(repository.consentCalls, 1);
      expect(repository.request.method, EvaluationMethod.ai);
      expect(
        find.byKey(EvaluationProcessingScreen.redirectButtonKey),
        findsOneWidget,
      );
      expect(
        find.byKey(EvaluationProcessingScreen.redirectErrorKey),
        findsOneWidget,
      );
      expect(find.textContaining('AI route remains unchanged'), findsOneWidget);
    });
  });
}

class _ConsentFakeRepository extends UnconfiguredAuratioEvaluationRepository {
  _ConsentFakeRepository({this.rejectRedirect = false});

  final bool rejectRedirect;
  int consentCalls = 0;

  PersistedEvaluationRequest request = PersistedEvaluationRequest(
    id: '11111111-1111-4111-8111-111111111111',
    submissionId: '22222222-2222-4222-8222-222222222222',
    trackId: 'business-pitch',
    requestedMethod: EvaluationMethod.ai,
    method: EvaluationMethod.ai,
    status: PersistedEvaluationStatus.processing,
    createdAt: DateTime.utc(2026, 9, 8, 10),
    updatedAt: DateTime.utc(2026, 9, 8, 10),
    submittedAt: DateTime.utc(2026, 9, 8, 9, 59),
  );

  @override
  bool get isConfigured => true;

  @override
  Future<PersistedEvaluationRequest?> fetchLatestRequest() async => request;

  @override
  Future<PersistedEvaluationRequest?> fetchActiveRequest() async => request;

  @override
  Future<PersistedEvaluationRequest> consentAiToHuman(String requestId) async {
    consentCalls++;
    if (rejectRedirect) {
      throw const AuratioEvaluationDataException(
        'mode_redirection_rejected',
        'The AI route remains unchanged.',
      );
    }

    request = PersistedEvaluationRequest(
      id: request.id,
      submissionId: request.submissionId,
      trackId: request.trackId,
      requestedMethod: EvaluationMethod.ai,
      method: EvaluationMethod.human,
      status: PersistedEvaluationStatus.unassigned,
      createdAt: request.createdAt,
      updatedAt: DateTime.utc(2026, 9, 8, 10, 1),
      submittedAt: request.submittedAt,
    );
    return request;
  }
}
