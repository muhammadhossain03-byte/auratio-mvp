import 'package:auratio_mobile/features/evaluations/application/latest_evaluation_request_provider.dart';
import 'package:auratio_mobile/features/evaluations/domain/evaluation_method.dart';
import 'package:auratio_mobile/features/evaluations/domain/persisted_evaluation.dart';
import 'package:auratio_mobile/features/home/presentation/screens/persisted_home_screen.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/profile/application/profile_state_providers.dart';
import 'package:auratio_mobile/features/profile/data/profile_repository.dart';
import 'package:auratio_mobile/features/progress/application/progress_data_providers.dart';
import 'package:auratio_mobile/features/progress/domain/progress_models.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('PersistedHomeScreen regression tests', () {
    testWidgets('TEST 1 — real data replaces mocks', (tester) async {
      const profile = PersistedEndUserProfile(
        userId: 'user-1',
        email: 'speaker@example.com',
        displayName: 'Test Speaker',
        paths: {AuratioPath.publicSpeaking, AuratioPath.contentCreation},
      );

      const progress = UserProgressSnapshot(
        overallMastery: 83.5,
        representedTracks: 1,
        approvedEvaluations: 2,
        approvedAi: 1,
        approvedHuman: 1,
        tracks: [],
      );

      final latest = PersistedEvaluationRequest(
        id: 'req-1',
        submissionId: 'sub-1',
        trackId: 'extempore',
        method: EvaluationMethod.ai,
        status: PersistedEvaluationStatus.approved,
        createdAt: DateTime(2026, 9, 10, 10, 0),
        updatedAt: DateTime(2026, 9, 10, 10, 0),
        submittedAt: DateTime(2026, 9, 10, 10, 0),
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            persistedEndUserProfileProvider.overrideWith(
              (ref) async => profile,
            ),
            userProgressProvider.overrideWith((ref) async => progress),
            latestEvaluationRequestProvider.overrideWith((ref) async => latest),
          ],
          child: const MaterialApp(home: PersistedHomeScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Hello, Test'), findsOneWidget);
      expect(find.text('TS'), findsOneWidget);
      expect(find.text('Extempore'), findsOneWidget);
      expect(find.text('AI Evaluation'), findsOneWidget);
      expect(find.text('Approved'), findsOneWidget);
      expect(find.textContaining('83.5 / 100'), findsOneWidget);
      expect(find.textContaining('2 Approved evaluations'), findsOneWidget);
      expect(find.text('Public Speaking'), findsOneWidget);
      expect(find.text('Content Creation'), findsOneWidget);

      expect(find.text('Hello, Alex'), findsNothing);
      expect(find.text('AM'), findsNothing);
      expect(find.textContaining('84.2 / 100'), findsNothing);
      expect(find.text('Business Pitch / Sales Pitch'), findsNothing);
    });

    testWidgets('TEST 2 — empty real account state', (tester) async {
      const profile = PersistedEndUserProfile(
        userId: 'user-2',
        email: 'new@example.com',
        displayName: 'New User',
        paths: {},
      );

      const progress = UserProgressSnapshot(
        overallMastery: null,
        representedTracks: 0,
        approvedEvaluations: 0,
        approvedAi: 0,
        approvedHuman: 0,
        tracks: [],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            persistedEndUserProfileProvider.overrideWith(
              (ref) async => profile,
            ),
            userProgressProvider.overrideWith((ref) async => progress),
            latestEvaluationRequestProvider.overrideWith((ref) async => null),
          ],
          child: const MaterialApp(home: PersistedHomeScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Hello, New'), findsOneWidget);
      expect(
        find.text("No active evaluation. Start a new one when you're ready."),
        findsOneWidget,
      );
      expect(find.text('Browse Tracks'), findsOneWidget);
      expect(find.text('No evaluations yet'), findsOneWidget);
      expect(
        find.text('Your latest evaluation will appear here.'),
        findsOneWidget,
      );
      expect(
        find.text('— / 100 • No Approved evaluations yet.'),
        findsOneWidget,
      );
      expect(find.text('No Paths selected yet.'), findsOneWidget);
      expect(find.text('Choose Paths'), findsOneWidget);
    });

    testWidgets('TEST 3 — active evaluation', (tester) async {
      const profile = PersistedEndUserProfile(
        userId: 'user-3',
        email: 'user3@example.com',
        displayName: 'Active User',
        paths: {AuratioPath.publicSpeaking},
      );

      const progress = UserProgressSnapshot(
        overallMastery: 75.0,
        representedTracks: 1,
        approvedEvaluations: 1,
        approvedAi: 1,
        approvedHuman: 0,
        tracks: [],
      );

      final latest = PersistedEvaluationRequest(
        id: 'req-3',
        submissionId: 'sub-3',
        trackId: 'extempore',
        method: EvaluationMethod.ai,
        status: PersistedEvaluationStatus.processing,
        createdAt: DateTime(2026, 9, 10, 10, 0),
        updatedAt: DateTime(2026, 9, 10, 10, 0),
        submittedAt: DateTime(2026, 9, 10, 10, 0),
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            persistedEndUserProfileProvider.overrideWith(
              (ref) async => profile,
            ),
            userProgressProvider.overrideWith((ref) async => progress),
            latestEvaluationRequestProvider.overrideWith((ref) async => latest),
          ],
          child: const MaterialApp(home: PersistedHomeScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(
        find.text('You have an active evaluation awaiting a final decision.'),
        findsOneWidget,
      );
      expect(find.text('View Active Evaluation'), findsOneWidget);
      expect(find.text('Processing'), findsOneWidget);
    });
  });
}
