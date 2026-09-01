import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_pending_moderation_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_rejected_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 9 Visual QA Verification', () {
    testWidgets(
      'visual QA: Pending Moderation (282:568) layout and card states',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationStatusPendingModeration,
          settle: false,
        );
        await tester.pump();

        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationStatusPendingModeration,
        );

        // Header
        expect(find.text('Evaluation Status'), findsOneWidget);
        expect(find.text('‹'), findsOneWidget);

        // Status Badge
        expect(
          find.byKey(EvaluationPendingModerationScreen.badgeKey),
          findsOneWidget,
        );
        expect(find.text('Pending Moderation'), findsNWidgets(2));

        // Heading & Subtitle
        expect(
          find.text('Review is required before publication'),
          findsOneWidget,
        );
        expect(
          find.text(
            'The score is complete but cannot take effect until admin review is resolved.',
          ),
          findsOneWidget,
        );

        // Status Card
        expect(
          find.byKey(EvaluationPendingModerationScreen.statusCardKey),
          findsOneWidget,
        );
        expect(find.text('PUBLICATION STATUS'), findsOneWidget);
        expect(
          find.text(
            'The score may be visible as pending, but it does not update private progress or public ranking.',
          ),
          findsOneWidget,
        );

        // Why Review Card
        expect(
          find.byKey(EvaluationPendingModerationScreen.whyReviewCardKey),
          findsOneWidget,
        );
        expect(find.text('Why review may be required'), findsOneWidget);
        expect(
          find.text(
            'Human: first evaluation in a track, or a later score more than ±15 points from prior Approved Human average.',
          ),
          findsOneWidget,
        );
        expect(
          find.text(
            'MVP scope: Pending Moderation applies to Human Evaluation only. A failed or unusable AI Evaluation becomes Rejected after its single attempt.',
          ),
          findsOneWidget,
        );

        // Bottom CTA
        expect(
          find.widgetWithText(AuratioButton, 'Return to Home'),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'visual QA: Evaluation Rejected (282:588) layout and card states',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationStatusRejected,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.evaluationStatusRejected);

        // Header
        expect(find.text('Evaluation Status'), findsOneWidget);
        expect(find.text('‹'), findsOneWidget);

        // Status Badge
        expect(find.byKey(EvaluationRejectedScreen.badgeKey), findsOneWidget);
        expect(find.text('Rejected'), findsNWidgets(2));

        // Heading & Subtitle
        expect(find.text('Evaluation rejected'), findsOneWidget);
        expect(
          find.text(
            'The completed evaluation was not accepted for publication.',
          ),
          findsOneWidget,
        );

        // Status Card
        expect(
          find.byKey(EvaluationRejectedScreen.statusCardKey),
          findsOneWidget,
        );
        expect(find.text('PUBLICATION STATUS'), findsOneWidget);
        expect(
          find.text(
            'No progress, rating-window, qualification, or leaderboard effect is created.',
          ),
          findsOneWidget,
        );

        // What Next Card
        expect(
          find.byKey(EvaluationRejectedScreen.whatNextCardKey),
          findsOneWidget,
        );
        expect(find.text('What happens next'), findsOneWidget);
        expect(
          find.text(
            'You may resubmit where permitted. The temporary video can be deleted after this final publication decision.',
          ),
          findsOneWidget,
        );

        // CTAs / Visuals
        expect(
          find.byKey(EvaluationRejectedScreen.startNewVisualKey),
          findsOneWidget,
        );
        expect(find.text('Start a New Evaluation'), findsOneWidget);
        expect(
          find.widgetWithText(AuratioButton, 'Start a New Evaluation'),
          findsNothing,
        );
        expect(
          find.widgetWithText(AuratioButton, 'Return to Home'),
          findsOneWidget,
        );
      },
    );
  });
}
