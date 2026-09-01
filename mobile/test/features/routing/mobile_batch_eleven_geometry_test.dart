import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_ai_all_time_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_human_all_time_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 11 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Leaderboard AI All-Time (282:509) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.leaderboard,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.leaderboard);

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Track title: x=20, y=116
        final trackFinder = find.byKey(
          LeaderboardAiAllTimeScreen.trackTitleKey,
        );
        expect(trackFinder, findsOneWidget);
        final trackRect = tester.getRect(trackFinder);
        expect(trackRect.left, 20.0);
        expect(trackRect.top, 116.0);

        // Path label: x=20, y=146
        final pathFinder = find.byKey(LeaderboardAiAllTimeScreen.pathLabelKey);
        expect(pathFinder, findsOneWidget);
        final pathRect = tester.getRect(pathFinder);
        expect(pathRect.left, 20.0);
        expect(pathRect.top, 146.0);

        // Mode Pills: AI Rect(20, 178, 84, 34), Human Rect(112, 178, 84, 34)
        final aiModePill = find.byKey(LeaderboardAiAllTimeScreen.modeAiPillKey);
        expect(aiModePill, findsOneWidget);
        final aiModeRect = tester.getRect(aiModePill);
        expect(aiModeRect.left, 20.0);
        expect(aiModeRect.top, 178.0);
        expect(aiModeRect.width, 84.0);
        expect(aiModeRect.height, 34.0);

        final humanModePill = find.byKey(
          LeaderboardAiAllTimeScreen.modeHumanPillKey,
        );
        expect(humanModePill, findsOneWidget);
        final humanModeRect = tester.getRect(humanModePill);
        expect(humanModeRect.left, 112.0);
        expect(humanModeRect.top, 178.0);
        expect(humanModeRect.width, 84.0);
        expect(humanModeRect.height, 34.0);

        // Period Pills: All-Time Rect(20, 224, 100, 34), Monthly Rect(128, 224, 100, 34)
        final allTimePill = find.byKey(
          LeaderboardAiAllTimeScreen.periodAllTimePillKey,
        );
        expect(allTimePill, findsOneWidget);
        final allTimeRect = tester.getRect(allTimePill);
        expect(allTimeRect.left, 20.0);
        expect(allTimeRect.top, 224.0);
        expect(allTimeRect.width, 100.0);
        expect(allTimeRect.height, 34.0);

        final monthlyPill = find.byKey(
          LeaderboardAiAllTimeScreen.periodMonthlyPillKey,
        );
        expect(monthlyPill, findsOneWidget);
        final monthlyRect = tester.getRect(monthlyPill);
        expect(monthlyRect.left, 128.0);
        expect(monthlyRect.top, 224.0);
        expect(monthlyRect.width, 100.0);
        expect(monthlyRect.height, 34.0);

        // Qualification Card: Rect(20, 274, 350, 82)
        final qualCard = find.byKey(
          LeaderboardAiAllTimeScreen.qualificationCardKey,
        );
        expect(qualCard, findsOneWidget);
        final qualRect = tester.getRect(qualCard);
        expect(qualRect.left, 20.0);
        expect(qualRect.top, 274.0);
        expect(qualRect.width, 350.0);
        expect(qualRect.height, 82.0);

        // Ranking Section Label: x=20, y=392
        final labelFinder = find.byKey(
          LeaderboardAiAllTimeScreen.rankingSectionLabelKey,
        );
        expect(labelFinder, findsOneWidget);
        final labelRect = tester.getRect(labelFinder);
        expect(labelRect.left, 20.0);
        expect(labelRect.top, 392.0);

        // Rank Cards: Card 1 Rect(20, 422, 350, 56), Card 2 Rect(20, 488, 350, 56), Card 3 Rect(20, 554, 350, 56)
        final card1 = find.byKey(LeaderboardAiAllTimeScreen.rankCard1Key);
        expect(card1, findsOneWidget);
        final card1Rect = tester.getRect(card1);
        expect(card1Rect.left, 20.0);
        expect(card1Rect.top, 422.0);
        expect(card1Rect.width, 350.0);
        expect(card1Rect.height, 56.0);

        final card2 = find.byKey(LeaderboardAiAllTimeScreen.rankCard2Key);
        expect(card2, findsOneWidget);
        final card2Rect = tester.getRect(card2);
        expect(card2Rect.left, 20.0);
        expect(card2Rect.top, 488.0);
        expect(card2Rect.width, 350.0);
        expect(card2Rect.height, 56.0);

        final card3 = find.byKey(LeaderboardAiAllTimeScreen.rankCard3Key);
        expect(card3, findsOneWidget);
        final card3Rect = tester.getRect(card3);
        expect(card3Rect.left, 20.0);
        expect(card3Rect.top, 554.0);
        expect(card3Rect.width, 350.0);
        expect(card3Rect.height, 56.0);

        // Your Position Card: Rect(20, 632, 350, 74)
        final posCard = find.byKey(
          LeaderboardAiAllTimeScreen.yourPositionCardKey,
        );
        expect(posCard, findsOneWidget);
        final posRect = tester.getRect(posCard);
        expect(posRect.left, 20.0);
        expect(posRect.top, 632.0);
        expect(posRect.width, 350.0);
        expect(posRect.height, 74.0);

        // How Ranking Works: Rect(20, 718, 350, 48)
        final howWorks = find.byKey(
          LeaderboardAiAllTimeScreen.howRankingWorksKey,
        );
        expect(howWorks, findsOneWidget);
        final howWorksRect = tester.getRect(howWorks);
        expect(howWorksRect.left, 20.0);
        expect(howWorksRect.top, 718.0);
        expect(howWorksRect.width, 350.0);
        expect(howWorksRect.height, 48.0);
      },
    );

    testWidgets(
      'Leaderboard Human All-Time (282:609) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.leaderboardHuman,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Track title: x=20, y=116
        final trackFinder = find.byKey(
          LeaderboardHumanAllTimeScreen.trackTitleKey,
        );
        expect(trackFinder, findsOneWidget);
        final trackRect = tester.getRect(trackFinder);
        expect(trackRect.left, 20.0);
        expect(trackRect.top, 116.0);

        // Path label: x=20, y=146
        final pathFinder = find.byKey(
          LeaderboardHumanAllTimeScreen.pathLabelKey,
        );
        expect(pathFinder, findsOneWidget);
        final pathRect = tester.getRect(pathFinder);
        expect(pathRect.left, 20.0);
        expect(pathRect.top, 146.0);

        // Mode Pills: AI Rect(20, 178, 84, 34), Human Rect(112, 178, 84, 34)
        final aiModePill = find.byKey(
          LeaderboardHumanAllTimeScreen.modeAiPillKey,
        );
        expect(aiModePill, findsOneWidget);
        final aiModeRect = tester.getRect(aiModePill);
        expect(aiModeRect.left, 20.0);
        expect(aiModeRect.top, 178.0);
        expect(aiModeRect.width, 84.0);
        expect(aiModeRect.height, 34.0);

        final humanModePill = find.byKey(
          LeaderboardHumanAllTimeScreen.modeHumanPillKey,
        );
        expect(humanModePill, findsOneWidget);
        final humanModeRect = tester.getRect(humanModePill);
        expect(humanModeRect.left, 112.0);
        expect(humanModeRect.top, 178.0);
        expect(humanModeRect.width, 84.0);
        expect(humanModeRect.height, 34.0);

        // Period Pills: All-Time Rect(20, 224, 100, 34), Monthly Rect(128, 224, 100, 34)
        final allTimePill = find.byKey(
          LeaderboardHumanAllTimeScreen.periodAllTimePillKey,
        );
        expect(allTimePill, findsOneWidget);
        final allTimeRect = tester.getRect(allTimePill);
        expect(allTimeRect.left, 20.0);
        expect(allTimeRect.top, 224.0);
        expect(allTimeRect.width, 100.0);
        expect(allTimeRect.height, 34.0);

        final monthlyPill = find.byKey(
          LeaderboardHumanAllTimeScreen.periodMonthlyPillKey,
        );
        expect(monthlyPill, findsOneWidget);
        final monthlyRect = tester.getRect(monthlyPill);
        expect(monthlyRect.left, 128.0);
        expect(monthlyRect.top, 224.0);
        expect(monthlyRect.width, 100.0);
        expect(monthlyRect.height, 34.0);

        // Qualification Card: Rect(20, 274, 350, 98)
        final qualCard = find.byKey(
          LeaderboardHumanAllTimeScreen.qualificationCardKey,
        );
        expect(qualCard, findsOneWidget);
        final qualRect = tester.getRect(qualCard);
        expect(qualRect.left, 20.0);
        expect(qualRect.top, 274.0);
        expect(qualRect.width, 350.0);
        expect(qualRect.height, 98.0);

        // Ranking Section Label: x=20, y=392
        final labelFinder = find.byKey(
          LeaderboardHumanAllTimeScreen.rankingSectionLabelKey,
        );
        expect(labelFinder, findsOneWidget);
        final labelRect = tester.getRect(labelFinder);
        expect(labelRect.left, 20.0);
        expect(labelRect.top, 392.0);

        // Rank Cards: Card 1 Rect(20, 422, 350, 56), Card 2 Rect(20, 488, 350, 56), Card 3 Rect(20, 554, 350, 56)
        final card1 = find.byKey(LeaderboardHumanAllTimeScreen.rankCard1Key);
        expect(card1, findsOneWidget);
        final card1Rect = tester.getRect(card1);
        expect(card1Rect.left, 20.0);
        expect(card1Rect.top, 422.0);
        expect(card1Rect.width, 350.0);
        expect(card1Rect.height, 56.0);

        final card2 = find.byKey(LeaderboardHumanAllTimeScreen.rankCard2Key);
        expect(card2, findsOneWidget);
        final card2Rect = tester.getRect(card2);
        expect(card2Rect.left, 20.0);
        expect(card2Rect.top, 488.0);
        expect(card2Rect.width, 350.0);
        expect(card2Rect.height, 56.0);

        final card3 = find.byKey(LeaderboardHumanAllTimeScreen.rankCard3Key);
        expect(card3, findsOneWidget);
        final card3Rect = tester.getRect(card3);
        expect(card3Rect.left, 20.0);
        expect(card3Rect.top, 554.0);
        expect(card3Rect.width, 350.0);
        expect(card3Rect.height, 56.0);

        // Your Qualification Card: Rect(20, 632, 350, 74)
        final qualBottomCard = find.byKey(
          LeaderboardHumanAllTimeScreen.yourQualificationCardKey,
        );
        expect(qualBottomCard, findsOneWidget);
        final qualBottomRect = tester.getRect(qualBottomCard);
        expect(qualBottomRect.left, 20.0);
        expect(qualBottomRect.top, 632.0);
        expect(qualBottomRect.width, 350.0);
        expect(qualBottomRect.height, 74.0);

        // How Ranking Works: Rect(20, 718, 350, 48)
        final howWorks = find.byKey(
          LeaderboardHumanAllTimeScreen.howRankingWorksKey,
        );
        expect(howWorks, findsOneWidget);
        final howWorksRect = tester.getRect(howWorks);
        expect(howWorksRect.left, 20.0);
        expect(howWorksRect.top, 718.0);
        expect(howWorksRect.width, 350.0);
        expect(howWorksRect.height, 48.0);
      },
    );
  });
}
