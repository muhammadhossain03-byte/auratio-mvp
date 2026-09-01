import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_human_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets(
    'visual QA: Evaluation Result • AI (282:423) layout and control states',
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
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with Back button and title
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Evaluation Result'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Status badge: Approved
      expect(find.byKey(EvaluationResultAiScreen.badgeKey), findsOneWidget);
      expect(find.text('Approved'), findsOneWidget);

      // Heading and Method
      expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
      expect(find.text('AI Evaluation'), findsOneWidget);

      // Score Card
      expect(find.text('TOTAL SCORE'), findsOneWidget);
      expect(find.text('88 / 100'), findsOneWidget);
      expect(find.text('Universal Delivery  35 / 40'), findsOneWidget);
      expect(find.text('Structural Flow  18 / 20'), findsOneWidget);
      expect(find.text('Track Specialisation  35 / 40'), findsOneWidget);

      // Feedback Card
      expect(find.text('Feedback evidence'), findsOneWidget);
      expect(
        find.text(
          'Criterion-level feedback includes timestamped evidence, strength, weakness, and actionable improvement advice. Open the official .docx report for the complete Approved evaluation.',
        ),
        findsOneWidget,
      );

      // CTAs
      expect(
        find.widgetWithText(AuratioButton, 'Open Evaluation Report'),
        findsOneWidget,
      );
      expect(
        find.widgetWithText(AuratioButton, 'Back to Home'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'visual QA: Evaluation Result • Human (282:395) layout, XX placeholders, and control states',
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
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with Back button and title
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Evaluation Result'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Status badge: Approved
      expect(find.byKey(EvaluationResultHumanScreen.badgeKey), findsOneWidget);
      expect(find.text('Approved'), findsOneWidget);

      // Heading and Method
      expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
      expect(find.text('Human Evaluation'), findsOneWidget);

      // Score Card with exact XX placeholder
      expect(find.text('TOTAL SCORE'), findsOneWidget);
      expect(find.text('XX / 100'), findsOneWidget);
      expect(find.text('Approved • score is now effective'), findsOneWidget);

      // Breakdown Cards with exact XX placeholders
      expect(find.text('SCORE BREAKDOWN'), findsOneWidget);
      expect(find.text('Universal Delivery'), findsOneWidget);
      expect(find.text('XX / 40'), findsNWidgets(2)); // Universal & Track
      expect(find.text('Structural Flow'), findsOneWidget);
      expect(find.text('XX / 20'), findsOneWidget);
      expect(find.text('Track Specialisation'), findsOneWidget);

      // Report Info Card
      expect(find.text('.docx evaluation report'), findsOneWidget);
      expect(
        find.text(
          'The report remains available after the temporary video is deleted.',
        ),
        findsOneWidget,
      );

      // CTA
      expect(
        find.widgetWithText(AuratioButton, 'View Evaluation Report'),
        findsOneWidget,
      );

      // Footer
      expect(
        find.text(
          'Final decision published • temporary video deletion follows the defined lifecycle.',
        ),
        findsOneWidget,
      );
    },
  );
}
