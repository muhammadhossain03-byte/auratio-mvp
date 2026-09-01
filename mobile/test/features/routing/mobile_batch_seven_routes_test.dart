import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_human_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Evaluation Result • AI',
      path: AppRoutePaths.evaluationResultAi,
      identifyingCopy: '88 / 100',
      ctaLabel: 'Open Evaluation Report',
    ),
    _BatchScreenCase(
      name: 'Evaluation Result • Human',
      path: AppRoutePaths.evaluationResultHuman,
      identifyingCopy: 'XX / 100',
      ctaLabel: 'View Evaluation Report',
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
    'AI Approved Result -> Back to Home, Header Back, and Report boundary no-op',
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
      expect(find.byKey(EvaluationResultAiScreen.screenKey), findsOneWidget);

      // 1. Report CTA is a safe no-op at the Batch 7 boundary
      final openReportBtn = find.byKey(
        EvaluationResultAiScreen.openReportButtonKey,
      );
      expect(openReportBtn, findsOneWidget);
      await tester.tap(openReportBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);

      // 2. Back to Home secondary CTA navigates to Home
      final backHomeBtn = find.byKey(
        EvaluationResultAiScreen.backHomeButtonKey,
      );
      expect(backHomeBtn, findsOneWidget);
      await tester.tap(backHomeBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);

      // 3. Return to AI Result and test Header Back chevron
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationResultAi,
        settle: false,
      );
      await tester.pumpAndSettle();

      final backAffordance = find.text('‹');
      expect(backAffordance, findsOneWidget);
      await tester.tap(backAffordance);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);
    },
  );

  testWidgets(
    'Human Approved Result -> View Report boundary no-op and Header Back to Home',
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
      expect(find.byKey(EvaluationResultHumanScreen.screenKey), findsOneWidget);

      // 1. Report CTA is a safe no-op at the Batch 7 boundary
      final viewReportBtn = find.byKey(
        EvaluationResultHumanScreen.viewReportButtonKey,
      );
      expect(viewReportBtn, findsOneWidget);
      await tester.tap(viewReportBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationResultHuman);

      // 2. Header Back chevron navigates to Home
      final backAffordance = find.text('‹');
      expect(backAffordance, findsOneWidget);
      await tester.tap(backAffordance);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);
    },
  );

  testWidgets(
    'Processing screens remain Processing-only without automatic transition to Approved results',
    (tester) async {
      final router = await pumpAuratioApp(tester);

      // AI Processing screen stays on Processing after pumping time
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationProcessingAi,
        settle: false,
      );
      await tester.pumpAndSettle();
      await tester.pump(const Duration(seconds: 10));
      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingAi);

      // Human Processing screen stays on Processing after pumping time
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationProcessingHuman,
        settle: false,
      );
      await tester.pumpAndSettle();
      await tester.pump(const Duration(seconds: 10));
      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingHuman);
    },
  );
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
