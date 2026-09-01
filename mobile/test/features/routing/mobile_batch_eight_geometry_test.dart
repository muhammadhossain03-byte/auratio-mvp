import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_report_download_simulated_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_report_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 8 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Evaluation Report (282:446) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationReport,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Heading: y=120, x=20
        final headingFinder = find.byKey(EvaluationReportScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 120.0);

        // Subtitle: y=162, x=20
        final subtitleFinder = find.byKey(EvaluationReportScreen.subtitleKey);
        expect(subtitleFinder, findsOneWidget);
        final subtitleRect = tester.getRect(subtitleFinder);
        expect(subtitleRect.left, 20.0);
        expect(subtitleRect.top, 162.0);

        // Format Card: Rect(20, 224, 350, 108)
        final formatCardFinder = find.byKey(
          EvaluationReportScreen.formatCardKey,
        );
        expect(formatCardFinder, findsOneWidget);
        final formatCardRect = tester.getRect(formatCardFinder);
        expect(formatCardRect.left, 20.0);
        expect(formatCardRect.top, 224.0);
        expect(formatCardRect.width, 350.0);
        expect(formatCardRect.height, 108.0);

        // Contents Card: Rect(20, 350, 350, 176)
        final contentsCardFinder = find.byKey(
          EvaluationReportScreen.contentsCardKey,
        );
        expect(contentsCardFinder, findsOneWidget);
        final contentsCardRect = tester.getRect(contentsCardFinder);
        expect(contentsCardRect.left, 20.0);
        expect(contentsCardRect.top, 350.0);
        expect(contentsCardRect.width, 350.0);
        expect(contentsCardRect.height, 176.0);

        // Lifecycle Card: Rect(20, 546, 350, 92)
        final lifecycleCardFinder = find.byKey(
          EvaluationReportScreen.lifecycleCardKey,
        );
        expect(lifecycleCardFinder, findsOneWidget);
        final lifecycleCardRect = tester.getRect(lifecycleCardFinder);
        expect(lifecycleCardRect.left, 20.0);
        expect(lifecycleCardRect.top, 546.0);
        expect(lifecycleCardRect.width, 350.0);
        expect(lifecycleCardRect.height, 92.0);

        // Download Button: Rect(20, 688, 350, 48)
        final downloadBtnFinder = find.byKey(
          EvaluationReportScreen.downloadButtonKey,
        );
        expect(downloadBtnFinder, findsOneWidget);
        final downloadBtnRect = tester.getRect(downloadBtnFinder);
        expect(downloadBtnRect.left, 20.0);
        expect(downloadBtnRect.top, 688.0);
        expect(downloadBtnRect.width, 350.0);
        expect(downloadBtnRect.height, 48.0);

        // Back Button: Rect(20, 750, 350, 48)
        final backBtnFinder = find.byKey(EvaluationReportScreen.backButtonKey);
        expect(backBtnFinder, findsOneWidget);
        final backBtnRect = tester.getRect(backBtnFinder);
        expect(backBtnRect.left, 20.0);
        expect(backBtnRect.top, 750.0);
        expect(backBtnRect.width, 350.0);
        expect(backBtnRect.height, 48.0);
      },
    );

    testWidgets(
      'Evaluation Report • Download simulated (308:110) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationReportDownloadSimulated,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Heading: y=120, x=20
        final headingFinder = find.byKey(
          EvaluationReportDownloadSimulatedScreen.headingKey,
        );
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 120.0);

        // Subtitle: y=162, x=20
        final subtitleFinder = find.byKey(
          EvaluationReportDownloadSimulatedScreen.subtitleKey,
        );
        expect(subtitleFinder, findsOneWidget);
        final subtitleRect = tester.getRect(subtitleFinder);
        expect(subtitleRect.left, 20.0);
        expect(subtitleRect.top, 162.0);

        // Format Card: Rect(20, 224, 350, 108)
        final formatCardFinder = find.byKey(
          EvaluationReportDownloadSimulatedScreen.formatCardKey,
        );
        expect(formatCardFinder, findsOneWidget);
        final formatCardRect = tester.getRect(formatCardFinder);
        expect(formatCardRect.left, 20.0);
        expect(formatCardRect.top, 224.0);
        expect(formatCardRect.width, 350.0);
        expect(formatCardRect.height, 108.0);

        // Contents Card: Rect(20, 350, 350, 176)
        final contentsCardFinder = find.byKey(
          EvaluationReportDownloadSimulatedScreen.contentsCardKey,
        );
        expect(contentsCardFinder, findsOneWidget);
        final contentsCardRect = tester.getRect(contentsCardFinder);
        expect(contentsCardRect.left, 20.0);
        expect(contentsCardRect.top, 350.0);
        expect(contentsCardRect.width, 350.0);
        expect(contentsCardRect.height, 176.0);

        // Lifecycle Card: Rect(20, 546, 350, 92)
        final lifecycleCardFinder = find.byKey(
          EvaluationReportDownloadSimulatedScreen.lifecycleCardKey,
        );
        expect(lifecycleCardFinder, findsOneWidget);
        final lifecycleCardRect = tester.getRect(lifecycleCardFinder);
        expect(lifecycleCardRect.left, 20.0);
        expect(lifecycleCardRect.top, 546.0);
        expect(lifecycleCardRect.width, 350.0);
        expect(lifecycleCardRect.height, 92.0);

        // Download Started Button: Rect(20, 688, 350, 48)
        final downloadStartedBtnFinder = find.byKey(
          EvaluationReportDownloadSimulatedScreen.downloadStartedButtonKey,
        );
        expect(downloadStartedBtnFinder, findsOneWidget);
        final downloadStartedBtnRect = tester.getRect(downloadStartedBtnFinder);
        expect(downloadStartedBtnRect.left, 20.0);
        expect(downloadStartedBtnRect.top, 688.0);
        expect(downloadStartedBtnRect.width, 350.0);
        expect(downloadStartedBtnRect.height, 48.0);

        // Back Button: Rect(20, 750, 350, 48)
        final backBtnFinder = find.byKey(
          EvaluationReportDownloadSimulatedScreen.backButtonKey,
        );
        expect(backBtnFinder, findsOneWidget);
        final backBtnRect = tester.getRect(backBtnFinder);
        expect(backBtnRect.left, 20.0);
        expect(backBtnRect.top, 750.0);
        expect(backBtnRect.width, 350.0);
        expect(backBtnRect.height, 48.0);
      },
    );
  });
}
