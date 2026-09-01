import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_report_download_simulated_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_report_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets('visual QA: Evaluation Report (282:446) layout and card states', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.evaluationReport,
      settle: false,
    );
    await tester.pumpAndSettle();

    expect(router.state.uri.path, AppRoutePaths.evaluationReport);
    expectInsideTestCanvas(tester, find.byType(Scaffold));

    // Header with Back button and title
    expect(find.byType(AuratioScreenHeader), findsOneWidget);
    expect(find.text('Evaluation Report'), findsOneWidget);
    expect(find.text('‹'), findsOneWidget);

    // Heading and Subtitle
    expect(find.byKey(EvaluationReportScreen.headingKey), findsOneWidget);
    expect(find.text('Final Evaluation Report'), findsOneWidget);
    expect(find.byKey(EvaluationReportScreen.subtitleKey), findsOneWidget);
    expect(
      find.text('Downloadable Microsoft Word report for this evaluation.'),
      findsOneWidget,
    );

    // Card 1: REPORT FORMAT
    expect(find.byKey(EvaluationReportScreen.formatCardKey), findsOneWidget);
    expect(find.text('REPORT FORMAT'), findsOneWidget);
    expect(find.text('.docx'), findsOneWidget);
    expect(
      find.text(
        'The report remains accessible after the temporary video is deleted.',
      ),
      findsOneWidget,
    );

    // Card 2: Report contents
    expect(find.byKey(EvaluationReportScreen.contentsCardKey), findsOneWidget);
    expect(find.text('Report contents'), findsOneWidget);
    expect(find.text('✓'), findsNWidgets(4));
    expect(find.text('Overall and criterion-level scoring'), findsOneWidget);
    expect(find.text('Track-specific feedback'), findsOneWidget);
    expect(find.text('Timestamped evidence / justification'), findsOneWidget);
    expect(find.text('Evaluation-mode metadata'), findsOneWidget);

    // Card 3: Video lifecycle
    expect(find.byKey(EvaluationReportScreen.lifecycleCardKey), findsOneWidget);
    expect(find.text('Video lifecycle'), findsOneWidget);
    expect(
      find.text(
        'Final decision: Approved • Official .docx generated • Temporary-video deletion process started',
      ),
      findsOneWidget,
    );

    // CTAs
    expect(
      find.widgetWithText(AuratioButton, 'Download .docx'),
      findsOneWidget,
    );
    expect(
      find.widgetWithText(AuratioButton, 'Back to Result'),
      findsOneWidget,
    );
  });

  testWidgets(
    'visual QA: Evaluation Report • Download simulated (308:110) layout and simulated state',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationReportDownloadSimulated,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(
        router.state.uri.path,
        AppRoutePaths.evaluationReportDownloadSimulated,
      );
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with Back button and title
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Evaluation Report'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Heading and Subtitle
      expect(
        find.byKey(EvaluationReportDownloadSimulatedScreen.headingKey),
        findsOneWidget,
      );
      expect(find.text('Final Evaluation Report'), findsOneWidget);
      expect(
        find.byKey(EvaluationReportDownloadSimulatedScreen.subtitleKey),
        findsOneWidget,
      );
      expect(
        find.text(
          'Prototype simulation: the approved .docx download has started.',
        ),
        findsOneWidget,
      );

      // Card 1: REPORT FORMAT
      expect(
        find.byKey(EvaluationReportDownloadSimulatedScreen.formatCardKey),
        findsOneWidget,
      );
      expect(find.text('REPORT FORMAT'), findsOneWidget);
      expect(find.text('.docx'), findsOneWidget);
      expect(
        find.text(
          'The report remains accessible after the temporary video is deleted.',
        ),
        findsOneWidget,
      );

      // Card 2: Report contents
      expect(
        find.byKey(EvaluationReportDownloadSimulatedScreen.contentsCardKey),
        findsOneWidget,
      );
      expect(find.text('Report contents'), findsOneWidget);
      expect(find.text('✓'), findsNWidgets(4));
      expect(find.text('Overall and criterion-level scoring'), findsOneWidget);
      expect(find.text('Track-specific feedback'), findsOneWidget);
      expect(find.text('Timestamped evidence / justification'), findsOneWidget);
      expect(find.text('Evaluation-mode metadata'), findsOneWidget);

      // Card 3: Video lifecycle
      expect(
        find.byKey(EvaluationReportDownloadSimulatedScreen.lifecycleCardKey),
        findsOneWidget,
      );
      expect(find.text('Video lifecycle'), findsOneWidget);
      expect(
        find.text(
          'Final decision: Approved • Official .docx generated • Temporary-video deletion process started',
        ),
        findsOneWidget,
      );

      // CTAs
      expect(
        find.widgetWithText(AuratioButton, 'Download started ✓'),
        findsOneWidget,
      );
      expect(
        find.widgetWithText(AuratioButton, 'Back to Result'),
        findsOneWidget,
      );
    },
  );
}
