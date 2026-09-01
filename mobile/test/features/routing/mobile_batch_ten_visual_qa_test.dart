import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/private_progress_screen.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_mobile_navigation.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 10 Visual QA Verification', () {
    testWidgets(
      'visual QA: Private Progress (282:475) layout and mastery card states',
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

        // Header
        expect(find.text('Progress'), findsWidgets);

        // Heading & Intro
        expect(find.text('Your Private Progress'), findsOneWidget);
        expect(
          find.text(
            'Approved AI and Human evaluations appear in one private experience while their mode labels remain visible.',
          ),
          findsOneWidget,
        );

        // Overall Mastery Card
        expect(
          find.byKey(PrivateProgressScreen.overallMasteryCardKey),
          findsOneWidget,
        );
        expect(find.text('Overall Auratio Mastery'), findsOneWidget);
        expect(find.text('84.2 / 100'), findsOneWidget);
        expect(
          find.text(
            'Average of track mastery scores with at least one Approved evaluation.',
          ),
          findsOneWidget,
        );

        // Track Mastery Card
        expect(
          find.byKey(PrivateProgressScreen.trackMasteryCardKey),
          findsOneWidget,
        );
        expect(find.text('Business Pitch / Sales Pitch'), findsNWidgets(3));
        expect(find.text('Track Mastery 86.4 / 100'), findsOneWidget);
        expect(find.text('5 Approved • 3 AI + 2 Human'), findsOneWidget);
        expect(find.text('View Approved History  →'), findsOneWidget);

        // Recent Section
        expect(find.text('RECENT APPROVED EVALUATIONS'), findsOneWidget);
        expect(find.text('AI Evaluation • Approved'), findsOneWidget);
        expect(find.text('88 / 100'), findsOneWidget);
        expect(find.text('Human Evaluation • Approved'), findsOneWidget);
        expect(find.text('84 / 100'), findsOneWidget);

        // Bottom Nav with active Progress
        final navItem = tester.widget<AuratioMobileNavigationItem>(
          find.widgetWithText(AuratioMobileNavigationItem, 'Progress'),
        );
        expect(navItem.active, isTrue);
      },
    );

    testWidgets(
      'visual QA: Approved Evaluation History (308:65) layout and record cards',
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

        // Header
        expect(find.text('Approved History'), findsOneWidget);
        expect(find.text('‹'), findsOneWidget);

        // Intro
        expect(
          find.text(
            'Approved results remain in your private history even after they leave a public rating window.',
          ),
          findsOneWidget,
        );

        // Filter Pills
        expect(find.text('All'), findsOneWidget);
        expect(find.text('AI'), findsOneWidget);
        expect(find.text('Human'), findsOneWidget);

        // Record Cards
        expect(find.text('Business Pitch / Sales Pitch'), findsNWidgets(2));
        expect(find.text('Approved'), findsNWidgets(2));
        expect(find.text('AI Evaluation'), findsOneWidget);
        expect(find.text('Human Evaluation'), findsOneWidget);
        expect(find.text('88 / 100'), findsOneWidget);
        expect(find.text('84 / 100'), findsOneWidget);
        expect(find.text('Approved 22 Aug 2026'), findsOneWidget);
        expect(find.text('Approved 18 Aug 2026'), findsOneWidget);
        expect(find.text('View Result'), findsNWidgets(2));
        expect(find.text('Download .docx'), findsNWidgets(2));

        // Progress Effect Card
        expect(find.text('Progress effect'), findsOneWidget);
        expect(
          find.text(
            'Pending Moderation and Rejected evaluations do not update effective private progress and are not counted here as Approved records.',
          ),
          findsOneWidget,
        );

        // Bottom Nav with active Progress
        final navItem = tester.widget<AuratioMobileNavigationItem>(
          find.widgetWithText(AuratioMobileNavigationItem, 'Progress'),
        );
        expect(navItem.active, isTrue);
      },
    );
  });
}
