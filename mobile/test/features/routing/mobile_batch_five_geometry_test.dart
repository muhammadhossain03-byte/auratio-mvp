import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/choose_evaluation_method_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_routing_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 5 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Choose Evaluation Method (282:331 / 288:119) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.chooseEvaluationMethod,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Heading: y=122
        final headingFinder = find.text(
          'How should this performance\nbe evaluated?',
        );
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 122.0);

        // AI Card: Rect(20, 252, 350, 154)
        final aiCardFinder = find.byKey(ChooseEvaluationMethodScreen.aiCardKey);
        expect(aiCardFinder, findsOneWidget);
        final aiCardRect = tester.getRect(aiCardFinder);
        expect(aiCardRect.left, 20.0);
        expect(aiCardRect.top, 252.0);
        expect(aiCardRect.width, 350.0);
        expect(aiCardRect.height, 154.0);

        // Human Card: Rect(20, 424, 350, 154)
        final humanCardFinder = find.byKey(
          ChooseEvaluationMethodScreen.humanCardKey,
        );
        expect(humanCardFinder, findsOneWidget);
        final humanCardRect = tester.getRect(humanCardFinder);
        expect(humanCardRect.left, 20.0);
        expect(humanCardRect.top, 424.0);
        expect(humanCardRect.width, 350.0);
        expect(humanCardRect.height, 154.0);

        // Consent Card: Rect(20, 602, 350, 94)
        final consentCardFinder = find.byKey(
          ChooseEvaluationMethodScreen.consentCardKey,
        );
        expect(consentCardFinder, findsOneWidget);
        final consentCardRect = tester.getRect(consentCardFinder);
        expect(consentCardRect.left, 20.0);
        expect(consentCardRect.top, 602.0);
        expect(consentCardRect.width, 350.0);
        expect(consentCardRect.height, 94.0);

        // Continue Button: Rect(20, 714, 350, 48)
        final continueButtonFinder = find.byKey(
          ChooseEvaluationMethodScreen.continueButtonKey,
        );
        expect(continueButtonFinder, findsOneWidget);
        final continueButtonRect = tester.getRect(continueButtonFinder);
        expect(continueButtonRect.left, 20.0);
        expect(continueButtonRect.top, 714.0);
        expect(continueButtonRect.width, 350.0);
        expect(continueButtonRect.height, 48.0);
      },
    );

    testWidgets(
      'Evaluation Routing / Assigned AI (282:355) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.routingAssignedAi,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 122, 30)
        final badgeFinder = find.byKey(EvaluationRoutingScreen.badgeKey);
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 122.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164
        final headingFinder = find.byKey(EvaluationRoutingScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Routing Status Card: Rect(20, 220, 350, 116)
        final statusCardFinder = find.byKey(
          EvaluationRoutingScreen.statusCardKey,
        );
        expect(statusCardFinder, findsOneWidget);
        final statusCardRect = tester.getRect(statusCardFinder);
        expect(statusCardRect.left, 20.0);
        expect(statusCardRect.top, 220.0);
        expect(statusCardRect.width, 350.0);
        expect(statusCardRect.height, 116.0);

        // Info Card: Rect(20, 354, 350, 144)
        final infoCardFinder = find.byKey(EvaluationRoutingScreen.infoCardKey);
        expect(infoCardFinder, findsOneWidget);
        final infoCardRect = tester.getRect(infoCardFinder);
        expect(infoCardRect.left, 20.0);
        expect(infoCardRect.top, 354.0);
        expect(infoCardRect.width, 350.0);
        expect(infoCardRect.height, 144.0);

        // Continue Button: Rect(20, 750, 350, 48)
        final continueButtonFinder = find.byKey(
          EvaluationRoutingScreen.continueButtonKey,
        );
        expect(continueButtonFinder, findsOneWidget);
        final continueButtonRect = tester.getRect(continueButtonFinder);
        expect(continueButtonRect.left, 20.0);
        expect(continueButtonRect.top, 750.0);
        expect(continueButtonRect.width, 350.0);
        expect(continueButtonRect.height, 48.0);
      },
    );

    testWidgets(
      'Evaluation Routing / Assigned Human (282:549) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.routingAssignedHuman,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Badge: Rect(20, 116, 143, 30)
        final badgeFinder = find.byKey(EvaluationRoutingScreen.badgeKey);
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 143.0);
        expect(badgeRect.height, 30.0);

        // Heading: y=164
        final headingFinder = find.byKey(EvaluationRoutingScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Routing Status Card: Rect(20, 220, 350, 116)
        final statusCardFinder = find.byKey(
          EvaluationRoutingScreen.statusCardKey,
        );
        expect(statusCardFinder, findsOneWidget);
        final statusCardRect = tester.getRect(statusCardFinder);
        expect(statusCardRect.left, 20.0);
        expect(statusCardRect.top, 220.0);
        expect(statusCardRect.width, 350.0);
        expect(statusCardRect.height, 116.0);

        // Info Card: Rect(20, 354, 350, 218)
        final infoCardFinder = find.byKey(EvaluationRoutingScreen.infoCardKey);
        expect(infoCardFinder, findsOneWidget);
        final infoCardRect = tester.getRect(infoCardFinder);
        expect(infoCardRect.left, 20.0);
        expect(infoCardRect.top, 354.0);
        expect(infoCardRect.width, 350.0);
        expect(infoCardRect.height, 218.0);

        // Continue Button: Rect(20, 750, 350, 48)
        final continueButtonFinder = find.byKey(
          EvaluationRoutingScreen.continueButtonKey,
        );
        expect(continueButtonFinder, findsOneWidget);
        final continueButtonRect = tester.getRect(continueButtonFinder);
        expect(continueButtonRect.left, 20.0);
        expect(continueButtonRect.top, 750.0);
        expect(continueButtonRect.width, 350.0);
        expect(continueButtonRect.height, 48.0);
      },
    );
  });
}
