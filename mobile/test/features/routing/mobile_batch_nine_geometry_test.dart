import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_pending_moderation_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_rejected_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 9 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Pending Moderation (282:568) rendered rectangles match Figma metadata',
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

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 150, 30)
        final badgeFinder = find.byKey(
          EvaluationPendingModerationScreen.badgeKey,
        );
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 150.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164, x=20
        final headingFinder = find.byKey(
          EvaluationPendingModerationScreen.headingKey,
        );
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Subtitle: y=220, x=20
        final subtitleFinder = find.byKey(
          EvaluationPendingModerationScreen.subtitleKey,
        );
        expect(subtitleFinder, findsOneWidget);
        final subtitleRect = tester.getRect(subtitleFinder);
        expect(subtitleRect.left, 20.0);
        expect(subtitleRect.top, 220.0);

        // Status Card: Rect(20, 282, 350, 118)
        final statusCardFinder = find.byKey(
          EvaluationPendingModerationScreen.statusCardKey,
        );
        expect(statusCardFinder, findsOneWidget);
        final statusCardRect = tester.getRect(statusCardFinder);
        expect(statusCardRect.left, 20.0);
        expect(statusCardRect.top, 282.0);
        expect(statusCardRect.width, 350.0);
        expect(statusCardRect.height, 118.0);

        // Why Review Card: Rect(20, 418, 350, 158)
        final whyReviewCardFinder = find.byKey(
          EvaluationPendingModerationScreen.whyReviewCardKey,
        );
        expect(whyReviewCardFinder, findsOneWidget);
        final whyReviewCardRect = tester.getRect(whyReviewCardFinder);
        expect(whyReviewCardRect.left, 20.0);
        expect(whyReviewCardRect.top, 418.0);
        expect(whyReviewCardRect.width, 350.0);
        expect(whyReviewCardRect.height, 158.0);

        // Return Home Button: Rect(20, 750, 350, 48)
        final returnHomeBtnFinder = find.byKey(
          EvaluationPendingModerationScreen.returnHomeButtonKey,
        );
        expect(returnHomeBtnFinder, findsOneWidget);
        final returnHomeBtnRect = tester.getRect(returnHomeBtnFinder);
        expect(returnHomeBtnRect.left, 20.0);
        expect(returnHomeBtnRect.top, 750.0);
        expect(returnHomeBtnRect.width, 350.0);
        expect(returnHomeBtnRect.height, 48.0);
      },
    );

    testWidgets(
      'Evaluation Rejected (282:588) rendered rectangles match Figma metadata',
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

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 80, 30)
        final badgeFinder = find.byKey(EvaluationRejectedScreen.badgeKey);
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 80.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164, x=20
        final headingFinder = find.byKey(EvaluationRejectedScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Subtitle: y=206, x=20
        final subtitleFinder = find.byKey(EvaluationRejectedScreen.subtitleKey);
        expect(subtitleFinder, findsOneWidget);
        final subtitleRect = tester.getRect(subtitleFinder);
        expect(subtitleRect.left, 20.0);
        expect(subtitleRect.top, 206.0);

        // Status Card: Rect(20, 266, 350, 120)
        final statusCardFinder = find.byKey(
          EvaluationRejectedScreen.statusCardKey,
        );
        expect(statusCardFinder, findsOneWidget);
        final statusCardRect = tester.getRect(statusCardFinder);
        expect(statusCardRect.left, 20.0);
        expect(statusCardRect.top, 266.0);
        expect(statusCardRect.width, 350.0);
        expect(statusCardRect.height, 120.0);

        // What Next Card: Rect(20, 404, 350, 120)
        final whatNextCardFinder = find.byKey(
          EvaluationRejectedScreen.whatNextCardKey,
        );
        expect(whatNextCardFinder, findsOneWidget);
        final whatNextCardRect = tester.getRect(whatNextCardFinder);
        expect(whatNextCardRect.left, 20.0);
        expect(whatNextCardRect.top, 404.0);
        expect(whatNextCardRect.width, 350.0);
        expect(whatNextCardRect.height, 120.0);

        // Start New Visual: Rect(20, 688, 350, 48)
        final startNewVisualFinder = find.byKey(
          EvaluationRejectedScreen.startNewVisualKey,
        );
        expect(startNewVisualFinder, findsOneWidget);
        final startNewVisualRect = tester.getRect(startNewVisualFinder);
        expect(startNewVisualRect.left, 20.0);
        expect(startNewVisualRect.top, 688.0);
        expect(startNewVisualRect.width, 350.0);
        expect(startNewVisualRect.height, 48.0);

        // Return Home Button: Rect(20, 750, 350, 48)
        final returnHomeBtnFinder = find.byKey(
          EvaluationRejectedScreen.returnHomeButtonKey,
        );
        expect(returnHomeBtnFinder, findsOneWidget);
        final returnHomeBtnRect = tester.getRect(returnHomeBtnFinder);
        expect(returnHomeBtnRect.left, 20.0);
        expect(returnHomeBtnRect.top, 750.0);
        expect(returnHomeBtnRect.width, 350.0);
        expect(returnHomeBtnRect.height, 48.0);
      },
    );
  });
}
