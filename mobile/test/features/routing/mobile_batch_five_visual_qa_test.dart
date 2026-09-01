import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/choose_evaluation_method_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_routing_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets(
    'visual QA: Choose Evaluation Method • AI selected (282:331) layout and control states',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.chooseEvaluationMethod,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.chooseEvaluationMethod);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with Back button and title
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Choose Evaluation'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Headings
      expect(
        find.text('How should this performance\nbe evaluated?'),
        findsOneWidget,
      );
      expect(
        find.text(
          'Both methods use Auratio’s same 100-point scoring architecture.',
        ),
        findsOneWidget,
      );

      // AI Card (Selected)
      expect(
        find.byKey(ChooseEvaluationMethodScreen.aiCardKey),
        findsOneWidget,
      );
      expect(find.text('AI EVALUATION'), findsOneWidget);
      expect(find.text('Fast structured evaluation'), findsOneWidget);
      expect(
        find.text(
          'Server-side AI evaluator scores the selected track rubric and provides timestamped evidence.',
        ),
        findsOneWidget,
      );

      // Human Card (Unselected)
      expect(
        find.byKey(ChooseEvaluationMethodScreen.humanCardKey),
        findsOneWidget,
      );
      expect(find.text('HUMAN EVALUATION'), findsOneWidget);
      expect(find.text('Evaluator-led review'), findsOneWidget);
      expect(
        find.text(
          'A Human Evaluator applies the same scoring architecture with required timestamped evidence.',
        ),
        findsOneWidget,
      );

      // Consent Card
      expect(
        find.byKey(ChooseEvaluationMethodScreen.consentCardKey),
        findsOneWidget,
      );
      expect(find.text('Redirects require your consent'), findsOneWidget);
      expect(
        find.text(
          'If the requested method is unavailable, Auratio may propose the alternate method. Declining cancels the request.',
        ),
        findsOneWidget,
      );

      // CTA
      expect(
        find.widgetWithText(AuratioButton, 'Continue with AI Evaluation'),
        findsOneWidget,
      );

      // Footer note
      expect(
        find.text(
          'Evaluator choice affects routing. Processing / moderation / publication status happens later.',
        ),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'visual QA: Choose Evaluation Method • Human selected (288:119) layout and control states',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        '${AppRoutePaths.chooseEvaluationMethod}?method=human',
        settle: false,
      );
      await tester.pumpAndSettle();

      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header
      expect(find.text('Choose Evaluation'), findsOneWidget);

      // CTA updates to Human
      expect(
        find.widgetWithText(AuratioButton, 'Continue with Human Evaluation'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'visual QA: Evaluation Routing / Assigned AI (282:355) layout and copy',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.routingAssignedAi,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.routingAssignedAi);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Evaluation Routing'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Badge & Heading
      expect(find.byKey(EvaluationRoutingScreen.badgeKey), findsOneWidget);
      expect(find.text('Assigned to AI'), findsWidgets);
      expect(find.text('Assigned to AI Evaluation'), findsOneWidget);

      // Status card
      expect(find.byKey(EvaluationRoutingScreen.statusCardKey), findsOneWidget);
      expect(find.text('ROUTING STATUS'), findsOneWidget);
      expect(find.text('Requested method: AI Evaluation'), findsOneWidget);
      expect(find.text('Current routing: Assigned to AI'), findsOneWidget);

      // Info card
      expect(find.byKey(EvaluationRoutingScreen.infoCardKey), findsOneWidget);
      expect(find.text('What this means'), findsOneWidget);
      expect(
        find.text(
          'Auratio will process this recording using the configured AI evaluator.',
        ),
        findsOneWidget,
      );
      expect(
        find.text(
          'Routing decides who evaluates. Publication/moderation is a separate later stage.',
        ),
        findsOneWidget,
      );

      // CTA
      expect(
        find.widgetWithText(AuratioButton, 'Continue to Status'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'visual QA: Evaluation Routing / Assigned Human (282:549) layout and copy',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.routingAssignedHuman,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.routingAssignedHuman);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Evaluation Routing'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Badge & Heading
      expect(find.byKey(EvaluationRoutingScreen.badgeKey), findsOneWidget);
      expect(find.text('Assigned to Human'), findsWidgets);
      expect(find.text('Assigned to Human Evaluation'), findsOneWidget);

      // Status card
      expect(find.byKey(EvaluationRoutingScreen.statusCardKey), findsOneWidget);
      expect(find.text('ROUTING STATUS'), findsOneWidget);
      expect(find.text('Requested method: Human Evaluation'), findsOneWidget);
      expect(find.text('Current routing: Assigned to Human'), findsOneWidget);

      // Info card
      expect(find.byKey(EvaluationRoutingScreen.infoCardKey), findsOneWidget);
      expect(find.text('Human evaluation'), findsOneWidget);
      expect(
        find.text(
          'An authorized evaluator completes the standardized rubric, criterion-specific anchor assessment, exact scores, and required structured feedback. The official .docx report is generated automatically only after publication approval.',
        ),
        findsOneWidget,
      );
      expect(
        find.text(
          'If this is your first Human Evaluation in this track, manual admin review is required before the score can take effect.',
        ),
        findsOneWidget,
      );

      // CTA
      expect(
        find.widgetWithText(AuratioButton, 'Continue to Status'),
        findsOneWidget,
      );
    },
  );
}
