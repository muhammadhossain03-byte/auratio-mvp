import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/choose_evaluation_method_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_routing_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/recording_accepted_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Choose Evaluation Method • AI selected',
      path: AppRoutePaths.chooseEvaluationMethod,
      identifyingCopy: 'How should this performance\nbe evaluated?',
      ctaLabel: 'Continue with AI Evaluation',
    ),
    _BatchScreenCase(
      name: 'Choose Evaluation Method • Human selected',
      path: '${AppRoutePaths.chooseEvaluationMethod}?method=human',
      identifyingCopy: 'How should this performance\nbe evaluated?',
      ctaLabel: 'Continue with Human Evaluation',
    ),
    _BatchScreenCase(
      name: 'Evaluation Routing / Assigned AI',
      path: AppRoutePaths.routingAssignedAi,
      identifyingCopy: 'Assigned to AI Evaluation',
      ctaLabel: 'Continue to Status',
    ),
    _BatchScreenCase(
      name: 'Evaluation Routing / Assigned Human',
      path: AppRoutePaths.routingAssignedHuman,
      identifyingCopy: 'Assigned to Human Evaluation',
      ctaLabel: 'Continue to Status',
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      await tester.pumpAndSettle();

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
    'Recording Accepted -> Choose Evaluation Method -> Switch selection -> Route to AI and Human routing screens',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.recordingAccepted,
        settle: false,
      );
      await tester.pumpAndSettle();

      // 1. On Recording Accepted
      expect(router.state.uri.path, AppRoutePaths.recordingAccepted);

      // Tap Continue -> navigates to Choose Evaluation Method
      final continueBtn = find.byKey(RecordingAcceptedScreen.continueButtonKey);
      expect(continueBtn, findsOneWidget);
      await tester.tap(continueBtn);
      await tester.pumpAndSettle();

      // 2. On Choose Evaluation Method (default AI selected)
      expect(router.state.uri.path, AppRoutePaths.chooseEvaluationMethod);
      expect(
        find.byKey(ChooseEvaluationMethodScreen.screenKey),
        findsOneWidget,
      );
      expect(
        find.widgetWithText(AuratioButton, 'Continue with AI Evaluation'),
        findsOneWidget,
      );

      // Tap Human Evaluation card
      final humanCard = find.byKey(ChooseEvaluationMethodScreen.humanCardKey);
      expect(humanCard, findsOneWidget);
      await tester.tap(humanCard);
      await tester.pumpAndSettle();

      // Verify button updated to Human Evaluation
      expect(
        find.widgetWithText(AuratioButton, 'Continue with Human Evaluation'),
        findsOneWidget,
      );

      // Tap AI Evaluation card
      final aiCard = find.byKey(ChooseEvaluationMethodScreen.aiCardKey);
      expect(aiCard, findsOneWidget);
      await tester.tap(aiCard);
      await tester.pumpAndSettle();

      // Verify button updated back to AI Evaluation
      expect(
        find.widgetWithText(AuratioButton, 'Continue with AI Evaluation'),
        findsOneWidget,
      );

      // Switch back to Human and Continue to Assigned Human routing
      await tester.tap(humanCard);
      await tester.pumpAndSettle();

      final continueToRoutingBtn = find.byKey(
        ChooseEvaluationMethodScreen.continueButtonKey,
      );
      await tester.tap(continueToRoutingBtn);
      await tester.pumpAndSettle();

      // 3. On Routing Assigned Human
      expect(router.state.uri.path, AppRoutePaths.routingAssignedHuman);
      expect(
        find.byKey(EvaluationRoutingScreen.humanScreenKey),
        findsOneWidget,
      );
      expect(find.text('Assigned to Human'), findsWidgets);
      expect(find.text('Assigned to Human Evaluation'), findsOneWidget);
      expect(find.text('Requested method: Human Evaluation'), findsOneWidget);
      expect(find.text('Current routing: Assigned to Human'), findsOneWidget);
      expect(find.text('Human evaluation'), findsOneWidget);

      // Tap Continue to Status (no-op at Batch 5 boundary)
      final statusBtn = find.byKey(EvaluationRoutingScreen.continueButtonKey);
      expect(statusBtn, findsOneWidget);
      await tester.tap(statusBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.routingAssignedHuman);

      // Back navigation from Routing Assigned Human goes back to Choose Evaluation
      final backAffordance = find.text('‹');
      expect(backAffordance, findsOneWidget);
      await tester.tap(backAffordance);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.chooseEvaluationMethod);

      // 4. Select AI and navigate to Routing Assigned AI
      await tester.tap(find.byKey(ChooseEvaluationMethodScreen.aiCardKey));
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(ChooseEvaluationMethodScreen.continueButtonKey),
      );
      await tester.pumpAndSettle();

      // On Routing Assigned AI
      expect(router.state.uri.path, AppRoutePaths.routingAssignedAi);
      expect(find.byKey(EvaluationRoutingScreen.aiScreenKey), findsOneWidget);
      expect(find.text('Assigned to AI'), findsWidgets);
      expect(find.text('Assigned to AI Evaluation'), findsOneWidget);
      expect(find.text('Requested method: AI Evaluation'), findsOneWidget);
      expect(find.text('Current routing: Assigned to AI'), findsOneWidget);
      expect(find.text('What this means'), findsOneWidget);

      // Back navigation from Routing Assigned AI
      await tester.tap(find.text('‹'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.chooseEvaluationMethod);

      // Back navigation from Choose Evaluation goes back to Recording Accepted
      await tester.tap(find.text('‹'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.recordingAccepted);
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
