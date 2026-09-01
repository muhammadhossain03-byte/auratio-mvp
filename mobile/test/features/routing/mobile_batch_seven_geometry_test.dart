import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_human_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 7 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Evaluation Result • AI (282:423) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationResultAi,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 80, 30)
        final badgeFinder = find.byKey(EvaluationResultAiScreen.badgeKey);
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 80.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164
        final headingFinder = find.byKey(EvaluationResultAiScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Method: y=198
        final methodFinder = find.byKey(EvaluationResultAiScreen.methodKey);
        expect(methodFinder, findsOneWidget);
        final methodRect = tester.getRect(methodFinder);
        expect(methodRect.left, 20.0);
        expect(methodRect.top, 198.0);

        // Total Score Card: Rect(20, 236, 350, 164)
        final scoreCardFinder = find.byKey(
          EvaluationResultAiScreen.scoreCardKey,
        );
        expect(scoreCardFinder, findsOneWidget);
        final scoreCardRect = tester.getRect(scoreCardFinder);
        expect(scoreCardRect.left, 20.0);
        expect(scoreCardRect.top, 236.0);
        expect(scoreCardRect.width, 350.0);
        expect(scoreCardRect.height, 164.0);

        // Feedback Card: Rect(20, 418, 350, 134)
        final feedbackCardFinder = find.byKey(
          EvaluationResultAiScreen.feedbackCardKey,
        );
        expect(feedbackCardFinder, findsOneWidget);
        final feedbackCardRect = tester.getRect(feedbackCardFinder);
        expect(feedbackCardRect.left, 20.0);
        expect(feedbackCardRect.top, 418.0);
        expect(feedbackCardRect.width, 350.0);
        expect(feedbackCardRect.height, 134.0);

        // Open Report Button: Rect(20, 688, 350, 48)
        final openReportFinder = find.byKey(
          EvaluationResultAiScreen.openReportButtonKey,
        );
        expect(openReportFinder, findsOneWidget);
        final openReportRect = tester.getRect(openReportFinder);
        expect(openReportRect.left, 20.0);
        expect(openReportRect.top, 688.0);
        expect(openReportRect.width, 350.0);
        expect(openReportRect.height, 48.0);

        // Back to Home Button: Rect(20, 750, 350, 48)
        final backHomeFinder = find.byKey(
          EvaluationResultAiScreen.backHomeButtonKey,
        );
        expect(backHomeFinder, findsOneWidget);
        final backHomeRect = tester.getRect(backHomeFinder);
        expect(backHomeRect.left, 20.0);
        expect(backHomeRect.top, 750.0);
        expect(backHomeRect.width, 350.0);
        expect(backHomeRect.height, 48.0);
      },
    );

    testWidgets(
      'Evaluation Result • Human (282:395) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationResultHuman,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 80, 30)
        final badgeFinder = find.byKey(EvaluationResultHumanScreen.badgeKey);
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 80.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164
        final headingFinder = find.byKey(
          EvaluationResultHumanScreen.headingKey,
        );
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Method: y=204
        final methodFinder = find.byKey(EvaluationResultHumanScreen.methodKey);
        expect(methodFinder, findsOneWidget);
        final methodRect = tester.getRect(methodFinder);
        expect(methodRect.left, 20.0);
        expect(methodRect.top, 204.0);

        // Total Score Card: Rect(20, 244, 350, 148)
        final scoreCardFinder = find.byKey(
          EvaluationResultHumanScreen.scoreCardKey,
        );
        expect(scoreCardFinder, findsOneWidget);
        final scoreCardRect = tester.getRect(scoreCardFinder);
        expect(scoreCardRect.left, 20.0);
        expect(scoreCardRect.top, 244.0);
        expect(scoreCardRect.width, 350.0);
        expect(scoreCardRect.height, 148.0);

        // Breakdown Card 1: Rect(20, 444, 350, 56)
        final b1Finder = find.byKey(
          EvaluationResultHumanScreen.breakdownUniversalKey,
        );
        expect(b1Finder, findsOneWidget);
        final b1Rect = tester.getRect(b1Finder);
        expect(b1Rect.left, 20.0);
        expect(b1Rect.top, 444.0);
        expect(b1Rect.width, 350.0);
        expect(b1Rect.height, 56.0);

        // Breakdown Card 2: Rect(20, 512, 350, 56)
        final b2Finder = find.byKey(
          EvaluationResultHumanScreen.breakdownStructuralKey,
        );
        expect(b2Finder, findsOneWidget);
        final b2Rect = tester.getRect(b2Finder);
        expect(b2Rect.left, 20.0);
        expect(b2Rect.top, 512.0);
        expect(b2Rect.width, 350.0);
        expect(b2Rect.height, 56.0);

        // Breakdown Card 3: Rect(20, 580, 350, 56)
        final b3Finder = find.byKey(
          EvaluationResultHumanScreen.breakdownTrackKey,
        );
        expect(b3Finder, findsOneWidget);
        final b3Rect = tester.getRect(b3Finder);
        expect(b3Rect.left, 20.0);
        expect(b3Rect.top, 580.0);
        expect(b3Rect.width, 350.0);
        expect(b3Rect.height, 56.0);

        // Report Card: Rect(20, 660, 350, 72)
        final reportFinder = find.byKey(
          EvaluationResultHumanScreen.reportCardKey,
        );
        expect(reportFinder, findsOneWidget);
        final reportRect = tester.getRect(reportFinder);
        expect(reportRect.left, 20.0);
        expect(reportRect.top, 660.0);
        expect(reportRect.width, 350.0);
        expect(reportRect.height, 72.0);

        // View Report Button: Rect(20, 748, 350, 48)
        final viewReportFinder = find.byKey(
          EvaluationResultHumanScreen.viewReportButtonKey,
        );
        expect(viewReportFinder, findsOneWidget);
        final viewReportRect = tester.getRect(viewReportFinder);
        expect(viewReportRect.left, 20.0);
        expect(viewReportRect.top, 748.0);
        expect(viewReportRect.width, 350.0);
        expect(viewReportRect.height, 48.0);

        // Footer: y=806
        final footerFinder = find.byKey(EvaluationResultHumanScreen.footerKey);
        expect(footerFinder, findsOneWidget);
        final footerRect = tester.getRect(footerFinder);
        expect(footerRect.left, 20.0);
        expect(footerRect.top, 806.0);
      },
    );
  });
}
