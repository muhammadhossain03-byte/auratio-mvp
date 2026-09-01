import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_processing_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 6 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Evaluation Processing • AI (282:374) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationProcessingAi,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 94, 30)
        final badgeFinder = find.byKey(EvaluationProcessingScreen.badgeKey);
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 94.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164
        final headingFinder = find.byKey(EvaluationProcessingScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Subtitle: y=206
        final subtitleFinder = find.byKey(
          EvaluationProcessingScreen.subtitleKey,
        );
        expect(subtitleFinder, findsOneWidget);
        final subtitleRect = tester.getRect(subtitleFinder);
        expect(subtitleRect.left, 20.0);
        expect(subtitleRect.top, 206.0);

        // Evaluation Card: Rect(20, 264, 350, 104)
        final evalCardFinder = find.byKey(
          EvaluationProcessingScreen.evaluationCardKey,
        );
        expect(evalCardFinder, findsOneWidget);
        final evalCardRect = tester.getRect(evalCardFinder);
        expect(evalCardRect.left, 20.0);
        expect(evalCardRect.top, 264.0);
        expect(evalCardRect.width, 350.0);
        expect(evalCardRect.height, 104.0);

        // Publication Status Card: Rect(20, 386, 350, 126)
        final pubCardFinder = find.byKey(
          EvaluationProcessingScreen.publicationStatusCardKey,
        );
        expect(pubCardFinder, findsOneWidget);
        final pubCardRect = tester.getRect(pubCardFinder);
        expect(pubCardRect.left, 20.0);
        expect(pubCardRect.top, 386.0);
        expect(pubCardRect.width, 350.0);
        expect(pubCardRect.height, 126.0);

        // Video Note: y=538
        final videoNoteFinder = find.byKey(
          EvaluationProcessingScreen.videoNoteKey,
        );
        expect(videoNoteFinder, findsOneWidget);
        final videoNoteRect = tester.getRect(videoNoteFinder);
        expect(videoNoteRect.left, 20.0);
        expect(videoNoteRect.top, 538.0);

        // Return to Home Button: Rect(20, 750, 350, 48)
        final buttonFinder = find.byKey(
          EvaluationProcessingScreen.returnHomeButtonKey,
        );
        expect(buttonFinder, findsOneWidget);
        final buttonRect = tester.getRect(buttonFinder);
        expect(buttonRect.left, 20.0);
        expect(buttonRect.top, 750.0);
        expect(buttonRect.width, 350.0);
        expect(buttonRect.height, 48.0);
      },
    );

    testWidgets(
      'Evaluation Processing • Human (297:132) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationProcessingHuman,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 94, 30)
        final badgeFinder = find.byKey(EvaluationProcessingScreen.badgeKey);
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 94.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164
        final headingFinder = find.byKey(EvaluationProcessingScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Subtitle: y=206
        final subtitleFinder = find.byKey(
          EvaluationProcessingScreen.subtitleKey,
        );
        expect(subtitleFinder, findsOneWidget);
        final subtitleRect = tester.getRect(subtitleFinder);
        expect(subtitleRect.left, 20.0);
        expect(subtitleRect.top, 206.0);

        // Evaluation Card: Rect(20, 264, 350, 104)
        final evalCardFinder = find.byKey(
          EvaluationProcessingScreen.evaluationCardKey,
        );
        expect(evalCardFinder, findsOneWidget);
        final evalCardRect = tester.getRect(evalCardFinder);
        expect(evalCardRect.left, 20.0);
        expect(evalCardRect.top, 264.0);
        expect(evalCardRect.width, 350.0);
        expect(evalCardRect.height, 104.0);

        // Publication Status Card: Rect(20, 386, 350, 126)
        final pubCardFinder = find.byKey(
          EvaluationProcessingScreen.publicationStatusCardKey,
        );
        expect(pubCardFinder, findsOneWidget);
        final pubCardRect = tester.getRect(pubCardFinder);
        expect(pubCardRect.left, 20.0);
        expect(pubCardRect.top, 386.0);
        expect(pubCardRect.width, 350.0);
        expect(pubCardRect.height, 126.0);

        // Video Note: y=538
        final videoNoteFinder = find.byKey(
          EvaluationProcessingScreen.videoNoteKey,
        );
        expect(videoNoteFinder, findsOneWidget);
        final videoNoteRect = tester.getRect(videoNoteFinder);
        expect(videoNoteRect.left, 20.0);
        expect(videoNoteRect.top, 538.0);

        // Return to Home Button: Rect(20, 750, 350, 48)
        final buttonFinder = find.byKey(
          EvaluationProcessingScreen.returnHomeButtonKey,
        );
        expect(buttonFinder, findsOneWidget);
        final buttonRect = tester.getRect(buttonFinder);
        expect(buttonRect.left, 20.0);
        expect(buttonRect.top, 750.0);
        expect(buttonRect.width, 350.0);
        expect(buttonRect.height, 48.0);
      },
    );
  });
}
