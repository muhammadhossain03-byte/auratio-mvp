import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_processing_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_routing_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Evaluation Processing • AI',
      path: AppRoutePaths.evaluationProcessingAi,
      identifyingCopy: 'Your evaluation is in progress',
      ctaLabel: 'Return to Home',
    ),
    _BatchScreenCase(
      name: 'Evaluation Processing • Human',
      path: AppRoutePaths.evaluationProcessingHuman,
      identifyingCopy: 'Your evaluation is in progress',
      ctaLabel: 'Return to Home',
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
    'Routing Assigned AI -> Continue to Status -> Evaluation Processing (AI) -> Return to Home',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.routingAssignedAi,
        settle: false,
      );
      await tester.pumpAndSettle();

      // 1. On Routing Assigned AI
      expect(router.state.uri.path, AppRoutePaths.routingAssignedAi);

      // Tap Continue to Status -> navigates to Evaluation Processing (AI)
      final continueBtn = find.byKey(EvaluationRoutingScreen.continueButtonKey);
      expect(continueBtn, findsOneWidget);
      await tester.tap(continueBtn);
      await tester.pumpAndSettle();

      // 2. On Evaluation Processing (AI)
      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingAi);
      expect(
        find.byKey(EvaluationProcessingScreen.aiScreenKey),
        findsOneWidget,
      );
      expect(find.text('Method: AI Evaluation'), findsOneWidget);

      // Tapping back chevron does not perform unexpected navigation
      final backAffordance = find.text('‹');
      expect(backAffordance, findsOneWidget);
      await tester.tap(backAffordance);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingAi);

      // Tap Return to Home -> navigates to Home
      final returnHomeBtn = find.byKey(
        EvaluationProcessingScreen.returnHomeButtonKey,
      );
      expect(returnHomeBtn, findsOneWidget);
      await tester.tap(returnHomeBtn);
      await tester.pumpAndSettle();

      // 3. On Home
      expect(router.state.uri.path, AppRoutePaths.home);
    },
  );

  testWidgets(
    'Routing Assigned Human -> Continue to Status -> Evaluation Processing (Human) -> Return to Home',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.routingAssignedHuman,
        settle: false,
      );
      await tester.pumpAndSettle();

      // 1. On Routing Assigned Human
      expect(router.state.uri.path, AppRoutePaths.routingAssignedHuman);

      // Tap Continue to Status -> navigates to Evaluation Processing (Human)
      final continueBtn = find.byKey(EvaluationRoutingScreen.continueButtonKey);
      expect(continueBtn, findsOneWidget);
      await tester.tap(continueBtn);
      await tester.pumpAndSettle();

      // 2. On Evaluation Processing (Human)
      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingHuman);
      expect(
        find.byKey(EvaluationProcessingScreen.humanScreenKey),
        findsOneWidget,
      );
      expect(find.text('Method: Human Evaluation'), findsOneWidget);

      // Tap Return to Home -> navigates to Home
      final returnHomeBtn = find.byKey(
        EvaluationProcessingScreen.returnHomeButtonKey,
      );
      expect(returnHomeBtn, findsOneWidget);
      await tester.tap(returnHomeBtn);
      await tester.pumpAndSettle();

      // 3. On Home
      expect(router.state.uri.path, AppRoutePaths.home);
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
