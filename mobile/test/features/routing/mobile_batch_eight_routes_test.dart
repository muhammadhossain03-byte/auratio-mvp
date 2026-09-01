import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_report_download_simulated_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_report_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_human_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Evaluation Report',
      path: AppRoutePaths.evaluationReport,
      identifyingCopy: 'Final Evaluation Report',
      ctaLabel: 'Download .docx',
    ),
    _BatchScreenCase(
      name: 'Evaluation Report • Download simulated',
      path: AppRoutePaths.evaluationReportDownloadSimulated,
      identifyingCopy:
          'Prototype simulation: the approved .docx download has started.',
      ctaLabel: null,
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, screen.path);
      expect(find.text(screen.identifyingCopy), findsWidgets);
      expectInsideTestCanvas(tester, find.byType(Scaffold));
      if (screen.ctaLabel != null) {
        expectInsideTestCanvas(
          tester,
          find.widgetWithText(AuratioButton, screen.ctaLabel!),
        );
      }
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets(
    'AI Result -> Report -> Back chevron and Back to Result return to AI Result',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationResultAi,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);

      // Tap Open Evaluation Report
      await tester.tap(
        find.byKey(EvaluationResultAiScreen.openReportButtonKey),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationReport);
      expect(find.byKey(EvaluationReportScreen.screenKey), findsOneWidget);

      // 1. Back chevron returns to AI Result
      final backChevron = find.text('‹');
      expect(backChevron, findsOneWidget);
      await tester.tap(backChevron);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);

      // Re-enter report screen
      await tester.tap(
        find.byKey(EvaluationResultAiScreen.openReportButtonKey),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationReport);

      // 2. Back to Result CTA returns to AI Result
      final backBtn = find.byKey(EvaluationReportScreen.backButtonKey);
      expect(backBtn, findsOneWidget);
      await tester.tap(backBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);
    },
  );

  testWidgets(
    'Human Result -> Report -> Back chevron and Back to Result return to Human Result',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationResultHuman,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationResultHuman);

      // Tap View Evaluation Report
      await tester.tap(
        find.byKey(EvaluationResultHumanScreen.viewReportButtonKey),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationReport);
      expect(find.byKey(EvaluationReportScreen.screenKey), findsOneWidget);

      // 1. Back chevron returns to Human Result
      final backChevron = find.text('‹');
      expect(backChevron, findsOneWidget);
      await tester.tap(backChevron);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationResultHuman);

      // Re-enter report screen
      await tester.tap(
        find.byKey(EvaluationResultHumanScreen.viewReportButtonKey),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationReport);

      // 2. Back to Result CTA returns to Human Result
      final backBtn = find.byKey(EvaluationReportScreen.backButtonKey);
      expect(backBtn, findsOneWidget);
      await tester.tap(backBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationResultHuman);
    },
  );

  testWidgets(
    'Report -> Download Simulated -> Back chevron and Back to Result return to Report',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationReport,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationReport);

      // Tap Download .docx
      await tester.tap(find.byKey(EvaluationReportScreen.downloadButtonKey));
      await tester.pumpAndSettle();
      expect(
        router.state.uri.path,
        AppRoutePaths.evaluationReportDownloadSimulated,
      );
      expect(
        find.byKey(EvaluationReportDownloadSimulatedScreen.screenKey),
        findsOneWidget,
      );

      // 1. Back chevron returns to Report
      final backChevron = find.text('‹');
      expect(backChevron, findsOneWidget);
      await tester.tap(backChevron);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationReport);

      // Re-enter simulated download screen
      await tester.tap(find.byKey(EvaluationReportScreen.downloadButtonKey));
      await tester.pumpAndSettle();
      expect(
        router.state.uri.path,
        AppRoutePaths.evaluationReportDownloadSimulated,
      );

      // 2. Back to Result returns to Report
      final backBtn = find.byKey(
        EvaluationReportDownloadSimulatedScreen.backButtonKey,
      );
      expect(backBtn, findsOneWidget);
      await tester.tap(backBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationReport);
    },
  );

  testWidgets('Simulated download is pure frontend mock without side-effects', (
    tester,
  ) async {
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
    expect(find.text('Download started ✓'), findsOneWidget);
    // Confirm Download started is non-interactive presentation container and NOT an AuratioButton
    expect(
      find.widgetWithText(AuratioButton, 'Download started ✓'),
      findsNothing,
    );

    // Tapping the status area causes no crashes, navigation, or unhandled side-effects
    await tester.tap(
      find.byKey(
        EvaluationReportDownloadSimulatedScreen.downloadStartedButtonKey,
      ),
    );
    await tester.pumpAndSettle();
    expect(
      router.state.uri.path,
      AppRoutePaths.evaluationReportDownloadSimulated,
    );
    expect(tester.takeException(), isNull);
  });
}

class _BatchScreenCase {
  const _BatchScreenCase({
    required this.name,
    required this.path,
    required this.identifyingCopy,
    required this.ctaLabel,
  });

  final String name;
  final String path;
  final String identifyingCopy;
  final String? ctaLabel;
}
