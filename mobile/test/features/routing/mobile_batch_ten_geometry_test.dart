import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/approved_evaluation_history_screen.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/private_progress_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_mobile_navigation.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 10 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Private Progress (282:475) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.progress,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.progress);

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Heading: y=118, x=20
        final headingFinder = find.byKey(PrivateProgressScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 118.0);

        // Intro: y=160, x=20
        final introFinder = find.byKey(PrivateProgressScreen.introKey);
        expect(introFinder, findsOneWidget);
        final introRect = tester.getRect(introFinder);
        expect(introRect.left, 20.0);
        expect(introRect.top, 160.0);

        // Overall Mastery Card: Rect(20, 222, 350, 122)
        final overallCardFinder = find.byKey(
          PrivateProgressScreen.overallMasteryCardKey,
        );
        expect(overallCardFinder, findsOneWidget);
        final overallCardRect = tester.getRect(overallCardFinder);
        expect(overallCardRect.left, 20.0);
        expect(overallCardRect.top, 222.0);
        expect(overallCardRect.width, 350.0);
        expect(overallCardRect.height, 122.0);

        // Track Mastery Card: Rect(20, 360, 350, 128)
        final trackCardFinder = find.byKey(
          PrivateProgressScreen.trackMasteryCardKey,
        );
        expect(trackCardFinder, findsOneWidget);
        final trackCardRect = tester.getRect(trackCardFinder);
        expect(trackCardRect.left, 20.0);
        expect(trackCardRect.top, 360.0);
        expect(trackCardRect.width, 350.0);
        expect(trackCardRect.height, 128.0);

        // Recent Section Label: y=514, x=20
        final labelFinder = find.byKey(
          PrivateProgressScreen.recentSectionLabelKey,
        );
        expect(labelFinder, findsOneWidget);
        final labelRect = tester.getRect(labelFinder);
        expect(labelRect.left, 20.0);
        expect(labelRect.top, 514.0);

        // AI Recent Card: Rect(20, 542, 350, 72)
        final aiRecentCardFinder = find.byKey(
          PrivateProgressScreen.aiRecentCardKey,
        );
        expect(aiRecentCardFinder, findsOneWidget);
        final aiRecentCardRect = tester.getRect(aiRecentCardFinder);
        expect(aiRecentCardRect.left, 20.0);
        expect(aiRecentCardRect.top, 542.0);
        expect(aiRecentCardRect.width, 350.0);
        expect(aiRecentCardRect.height, 72.0);

        // Human Recent Card: Rect(20, 628, 350, 72)
        final humanRecentCardFinder = find.byKey(
          PrivateProgressScreen.humanRecentCardKey,
        );
        expect(humanRecentCardFinder, findsOneWidget);
        final humanRecentCardRect = tester.getRect(humanRecentCardFinder);
        expect(humanRecentCardRect.left, 20.0);
        expect(humanRecentCardRect.top, 628.0);
        expect(humanRecentCardRect.width, 350.0);
        expect(humanRecentCardRect.height, 72.0);

        // Bottom Nav: Rect(0, 770, 390, 74)
        final bottomNavFinder = find.byType(AuratioMobileNavigationBar);
        expect(bottomNavFinder, findsOneWidget);
        final bottomNavRect = tester.getRect(bottomNavFinder);
        expect(bottomNavRect.left, 0.0);
        expect(bottomNavRect.top, 770.0);
        expect(bottomNavRect.width, 390.0);
        expect(bottomNavRect.height, 74.0);
      },
    );

    testWidgets(
      'Approved Evaluation History (308:65) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.approvedEvaluationHistory,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Intro: y=116, x=20
        final introFinder = find.byKey(
          ApprovedEvaluationHistoryScreen.introKey,
        );
        expect(introFinder, findsOneWidget);
        final introRect = tester.getRect(introFinder);
        expect(introRect.left, 20.0);
        expect(introRect.top, 116.0);

        // Filter Pills: All Rect(20, 166, 66, 34), AI Rect(94, 166, 66, 34), Human Rect(168, 166, 86, 34)
        final allPillFinder = find.byKey(
          ApprovedEvaluationHistoryScreen.filterAllPillKey,
        );
        expect(allPillFinder, findsOneWidget);
        final allPillRect = tester.getRect(allPillFinder);
        expect(allPillRect.left, 20.0);
        expect(allPillRect.top, 166.0);
        expect(allPillRect.width, 66.0);
        expect(allPillRect.height, 34.0);

        final aiPillFinder = find.byKey(
          ApprovedEvaluationHistoryScreen.filterAiPillKey,
        );
        expect(aiPillFinder, findsOneWidget);
        final aiPillRect = tester.getRect(aiPillFinder);
        expect(aiPillRect.left, 94.0);
        expect(aiPillRect.top, 166.0);
        expect(aiPillRect.width, 66.0);
        expect(aiPillRect.height, 34.0);

        final humanPillFinder = find.byKey(
          ApprovedEvaluationHistoryScreen.filterHumanPillKey,
        );
        expect(humanPillFinder, findsOneWidget);
        final humanPillRect = tester.getRect(humanPillFinder);
        expect(humanPillRect.left, 168.0);
        expect(humanPillRect.top, 166.0);
        expect(humanPillRect.width, 86.0);
        expect(humanPillRect.height, 34.0);

        // AI Record Card: Rect(20, 222, 350, 138)
        final aiRecordCardFinder = find.byKey(
          ApprovedEvaluationHistoryScreen.aiRecordCardKey,
        );
        expect(aiRecordCardFinder, findsOneWidget);
        final aiRecordCardRect = tester.getRect(aiRecordCardFinder);
        expect(aiRecordCardRect.left, 20.0);
        expect(aiRecordCardRect.top, 222.0);
        expect(aiRecordCardRect.width, 350.0);
        expect(aiRecordCardRect.height, 138.0);

        // Human Record Card: Rect(20, 378, 350, 138)
        final humanRecordCardFinder = find.byKey(
          ApprovedEvaluationHistoryScreen.humanRecordCardKey,
        );
        expect(humanRecordCardFinder, findsOneWidget);
        final humanRecordCardRect = tester.getRect(humanRecordCardFinder);
        expect(humanRecordCardRect.left, 20.0);
        expect(humanRecordCardRect.top, 378.0);
        expect(humanRecordCardRect.width, 350.0);
        expect(humanRecordCardRect.height, 138.0);

        // Progress Effect Card: Rect(20, 552, 350, 104)
        final progressEffectCardFinder = find.byKey(
          ApprovedEvaluationHistoryScreen.progressEffectCardKey,
        );
        expect(progressEffectCardFinder, findsOneWidget);
        final progressEffectCardRect = tester.getRect(progressEffectCardFinder);
        expect(progressEffectCardRect.left, 20.0);
        expect(progressEffectCardRect.top, 552.0);
        expect(progressEffectCardRect.width, 350.0);
        expect(progressEffectCardRect.height, 104.0);

        // Bottom Nav: Rect(0, 770, 390, 74)
        final bottomNavFinder = find.byType(AuratioMobileNavigationBar);
        expect(bottomNavFinder, findsOneWidget);
        final bottomNavRect = tester.getRect(bottomNavFinder);
        expect(bottomNavRect.left, 0.0);
        expect(bottomNavRect.top, 770.0);
        expect(bottomNavRect.width, 390.0);
        expect(bottomNavRect.height, 74.0);
      },
    );
  });
}
