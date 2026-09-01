import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_processing_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets(
    'visual QA: Evaluation Processing • AI (282:374) layout and control states',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationProcessingAi,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingAi);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with visual Back button (no bound action) and title
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Evaluation Status'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Status badge & Headings
      expect(find.byKey(EvaluationProcessingScreen.badgeKey), findsOneWidget);
      expect(find.text('Processing'), findsWidgets);
      expect(find.text('Your evaluation is in progress'), findsOneWidget);
      expect(
        find.text('The evaluation is being generated or reviewed.'),
        findsOneWidget,
      );

      // Evaluation Card
      expect(
        find.byKey(EvaluationProcessingScreen.evaluationCardKey),
        findsOneWidget,
      );
      expect(find.text('EVALUATION'), findsOneWidget);
      expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
      expect(find.text('Method: AI Evaluation'), findsOneWidget);

      // Publication Status Card
      expect(
        find.byKey(EvaluationProcessingScreen.publicationStatusCardKey),
        findsOneWidget,
      );
      expect(find.text('PUBLICATION STATUS'), findsOneWidget);
      expect(
        find.text(
          'No score, progress, rating-window, qualification, or leaderboard effect yet.',
        ),
        findsOneWidget,
      );

      // Temporary video note
      expect(
        find.text(
          'The temporary video remains available while evaluation or required moderation is in progress.',
        ),
        findsOneWidget,
      );

      // CTA
      expect(
        find.widgetWithText(AuratioButton, 'Return to Home'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'visual QA: Evaluation Processing • Human (297:132) layout and control states',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationProcessingHuman,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingHuman);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header
      expect(find.text('Evaluation Status'), findsOneWidget);
      expect(find.text('‹'), findsOneWidget);

      // Badge & Headings
      expect(find.text('Processing'), findsWidgets);
      expect(find.text('Your evaluation is in progress'), findsOneWidget);

      // Evaluation Card with Human method
      expect(find.text('Method: Human Evaluation'), findsOneWidget);

      // Publication Status Card
      expect(find.text('PUBLICATION STATUS'), findsOneWidget);

      // CTA
      expect(
        find.widgetWithText(AuratioButton, 'Return to Home'),
        findsOneWidget,
      );
    },
  );
}
