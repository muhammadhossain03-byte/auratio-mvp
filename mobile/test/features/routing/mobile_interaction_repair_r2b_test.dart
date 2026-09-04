import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_human_screen.dart';
import 'package:auratio_mobile/features/events/presentation/screens/events_discovery_screen.dart';
import 'package:auratio_mobile/features/leaderboard/application/leaderboard_period_provider.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_ai_all_time_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_human_all_time_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/widgets/how_ranking_works_modal.dart';
import 'package:auratio_mobile/features/onboarding/application/path_selection_controller.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/approved_evaluation_history_screen.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/tracks_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('AURATIO STEP IV — MOBILE INTERACTION REPAIR R2B REGRESSION MATRIX', () {
    Finder findTrackRows() => find.byWidgetPredicate(
      (widget) =>
          widget.key is ValueKey<String> &&
          (widget.key as ValueKey<String>).value.startsWith('track-row-'),
    );

    group('1. Tracks Category Filters & Track Details Routing', () {
      testWidgets(
        'Verifies exact row counts per filter, route navigation from each filter, and path provider isolation',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.tracks);

          expect(router.state.uri.path, AppRoutePaths.tracks);

          final container = ProviderScope.containerOf(
            tester.element(find.byType(TracksScreen)),
          );
          final initialPaths = Set<AuratioPath>.from(
            container.read(selectedPathsProvider),
          );

          // 1. Default All shows exactly 13 track rows
          expect(findTrackRows(), findsNWidgets(13));
          expect(find.text('PUBLIC SPEAKING'), findsOneWidget);
          expect(find.text('PROFESSIONAL PRESENTING'), findsOneWidget);
          expect(find.text('CONTENT CREATION'), findsOneWidget);

          // 2. Public Speaking shows exactly 5 track rows
          await tester.tap(
            find.byKey(TracksScreen.filterPublicSpeakingChipKey),
          );
          await tester.pumpAndSettle();
          expect(findTrackRows(), findsNWidgets(5));
          expect(find.text('PUBLIC SPEAKING'), findsOneWidget);
          expect(find.text('PROFESSIONAL PRESENTING'), findsNothing);
          expect(find.text('CONTENT CREATION'), findsNothing);

          // 3. Presenting shows exactly 5 track rows
          await tester.tap(find.byKey(TracksScreen.filterPresentingChipKey));
          await tester.pumpAndSettle();
          expect(findTrackRows(), findsNWidgets(5));
          expect(find.text('PUBLIC SPEAKING'), findsNothing);
          expect(find.text('PROFESSIONAL PRESENTING'), findsOneWidget);
          expect(find.text('CONTENT CREATION'), findsNothing);

          // 4. Content shows exactly 3 track rows
          await tester.tap(find.byKey(TracksScreen.filterContentChipKey));
          await tester.pumpAndSettle();
          expect(findTrackRows(), findsNWidgets(3));
          expect(find.text('PUBLIC SPEAKING'), findsNothing);
          expect(find.text('PROFESSIONAL PRESENTING'), findsNothing);
          expect(find.text('CONTENT CREATION'), findsOneWidget);

          // Switching track filters does NOT mutate selectedPathsProvider
          expect(container.read(selectedPathsProvider), equals(initialPaths));

          // 5. Navigate to Track Details from EACH filtered state:
          // a. From Content: open 'infotainment-oriented'
          await tester.tap(
            find.byKey(const Key('track-row-infotainment-oriented')),
          );
          await tester.pumpAndSettle();
          expect(router.state.uri.path, '/tracks/infotainment-oriented');
          expect(find.text('Infotainment-Oriented'), findsWidgets);

          // Return to Tracks
          await openAuratioRoute(tester, router, AppRoutePaths.tracks);

          // b. From Presenting: open 'business-pitch-sales-pitch'
          await tester.tap(find.byKey(TracksScreen.filterPresentingChipKey));
          await tester.pumpAndSettle();
          await tester.tap(
            find.byKey(const Key('track-row-business-pitch-sales-pitch')),
          );
          await tester.pumpAndSettle();
          expect(router.state.uri.path, '/tracks/business-pitch-sales-pitch');
          expect(find.text('Business Pitch / Sales Pitch'), findsWidgets);

          // Return to Tracks
          await openAuratioRoute(tester, router, AppRoutePaths.tracks);

          // c. From Public Speaking: open 'informative'
          await tester.tap(
            find.byKey(TracksScreen.filterPublicSpeakingChipKey),
          );
          await tester.pumpAndSettle();
          await tester.tap(find.byKey(const Key('track-row-informative')));
          await tester.pumpAndSettle();
          expect(router.state.uri.path, '/tracks/informative');
          expect(find.text('Informative'), findsWidgets);

          // Return to Tracks
          await openAuratioRoute(tester, router, AppRoutePaths.tracks);

          // d. From All: open 'explanatory'
          await tester.tap(find.byKey(TracksScreen.filterAllChipKey));
          await tester.pumpAndSettle();
          await tester.tap(find.byKey(const Key('track-row-explanatory')));
          await tester.pumpAndSettle();
          expect(router.state.uri.path, '/tracks/explanatory');
          expect(find.text('Explanatory'), findsWidgets);

          // Confirm selectedPathsProvider remains pristine
          expect(container.read(selectedPathsProvider), equals(initialPaths));
        },
      );
    });

    group('2. Events Discovery Filters & Path Relevance Matrix', () {
      testWidgets(
        'Verifies default relevance to selectedPathsProvider, path removal/restoration, dropdown filters, and isolated manual filters',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.events);

          expect(router.state.uri.path, AppRoutePaths.events);

          final container = ProviderScope.containerOf(
            tester.element(find.byType(EventsDiscoveryScreen)),
          );

          // 1. Default relevance respects selectedPathsProvider
          // (Initially Public Speaking + Professional Presenting are active)
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );
          expect(find.byKey(EventsDiscoveryScreen.emptyStateKey), findsNothing);

          // 2. Remove Public Speaking from selectedPathsProvider:
          // Public Speaking Summit disappears while Professional Presenting event remains
          container.read(selectedPathsProvider.notifier).setPaths({
            AuratioPath.professionalPresenting,
          });
          await tester.pumpAndSettle();

          expect(find.byKey(EventsDiscoveryScreen.eventCard1Key), findsNothing);
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );

          // 3. Restore paths for test isolation
          container.read(selectedPathsProvider.notifier).setPaths({
            AuratioPath.publicSpeaking,
            AuratioPath.professionalPresenting,
          });
          await tester.pumpAndSettle();

          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );

          // 4. Division filter -> non-Dhaka -> clean empty state
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterDivisionKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Chattogram Division'));
          await tester.pumpAndSettle();

          expect(
            find.byKey(EventsDiscoveryScreen.emptyStateKey),
            findsOneWidget,
          );
          expect(find.text('No matching events'), findsOneWidget);
          expect(find.byKey(EventsDiscoveryScreen.eventCard1Key), findsNothing);
          expect(find.byKey(EventsDiscoveryScreen.eventCard2Key), findsNothing);

          // Restore Dhaka Division
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterDivisionKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Dhaka Division'));
          await tester.pumpAndSettle();

          // 5. Path Public Speaking -> exact Summit only
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Public Speaking'));
          await tester.pumpAndSettle();

          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );
          expect(find.byKey(EventsDiscoveryScreen.eventCard2Key), findsNothing);

          // 6. Path Professional Presenting -> exact Meetup only
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Professional Presenting'));
          await tester.pumpAndSettle();

          expect(find.byKey(EventsDiscoveryScreen.eventCard1Key), findsNothing);
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );

          // 7. Path Content Creation -> clean empty state with current catalog
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Content Creation'));
          await tester.pumpAndSettle();

          expect(
            find.byKey(EventsDiscoveryScreen.emptyStateKey),
            findsOneWidget,
          );
          expect(find.byKey(EventsDiscoveryScreen.eventCard1Key), findsNothing);
          expect(find.byKey(EventsDiscoveryScreen.eventCard2Key), findsNothing);

          // 8. Event details navigation still works after a Path-filtered result
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Professional Presenting'));
          await tester.pumpAndSettle();

          await tester.tap(find.byKey(EventsDiscoveryScreen.eventCard2Key));
          await tester.pumpAndSettle();

          expect(router.state.uri.path, '/events/presentation-practice-meetup');
          expect(find.text('Presentation Practice Meetup'), findsWidgets);

          // Return to Events
          await openAuratioRoute(tester, router, AppRoutePaths.events);

          // 9. Date filter visibly changes Upcoming -> All Dates -> Upcoming
          expect(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterDateKey),
              matching: find.text('Upcoming'),
            ),
            findsOneWidget,
          );

          await tester.tap(find.byKey(EventsDiscoveryScreen.filterDateKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('All Dates'));
          await tester.pumpAndSettle();

          expect(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterDateKey),
              matching: find.text('All Dates'),
            ),
            findsOneWidget,
          );

          await tester.tap(find.byKey(EventsDiscoveryScreen.filterDateKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Upcoming'));
          await tester.pumpAndSettle();

          expect(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterDateKey),
              matching: find.text('Upcoming'),
            ),
            findsOneWidget,
          );

          // 10. Changing manual Path filters MUST NOT change selectedPathsProvider
          expect(
            container.read(selectedPathsProvider),
            equals({
              AuratioPath.publicSpeaking,
              AuratioPath.professionalPresenting,
            }),
          );
        },
      );
    });

    group('3. Approved History Filters & Action Integrity', () {
      testWidgets(
        'Verifies record filtering, View Result preserving Business Pitch across filters, and active download docx link',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.approvedEvaluationHistory,
          );

          expect(
            router.state.uri.path,
            AppRoutePaths.approvedEvaluationHistory,
          );

          // 1. All shows both records
          expect(
            find.byKey(ApprovedEvaluationHistoryScreen.aiRecordCardKey),
            findsOneWidget,
          );
          expect(
            find.byKey(ApprovedEvaluationHistoryScreen.humanRecordCardKey),
            findsOneWidget,
          );

          // 2. AI shows only AI record
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.filterAiPillKey),
          );
          await tester.pumpAndSettle();

          expect(
            find.byKey(ApprovedEvaluationHistoryScreen.aiRecordCardKey),
            findsOneWidget,
          );
          expect(
            find.byKey(ApprovedEvaluationHistoryScreen.humanRecordCardKey),
            findsNothing,
          );

          // 3. While AI filter active, View Result preserves Business Pitch identity
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.aiViewResultLinkKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);
          expect(
            router.state.uri.queryParameters['track'],
            'business-pitch-sales-pitch',
          );
          expect(find.byType(EvaluationResultAiScreen), findsOneWidget);
          expect(find.text('Business Pitch / Sales Pitch'), findsWidgets);

          // Return to history and test AI Download .docx link
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.approvedEvaluationHistory,
          );
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.filterAiPillKey),
          );
          await tester.pumpAndSettle();

          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.aiDownloadDocxLinkKey),
          );
          await tester.pumpAndSettle();
          expect(
            router.state.uri.path,
            AppRoutePaths.evaluationReportDownloadSimulated,
          );

          // 4. Human shows only Human record
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.approvedEvaluationHistory,
          );
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.filterHumanPillKey),
          );
          await tester.pumpAndSettle();

          expect(
            find.byKey(ApprovedEvaluationHistoryScreen.aiRecordCardKey),
            findsNothing,
          );
          expect(
            find.byKey(ApprovedEvaluationHistoryScreen.humanRecordCardKey),
            findsOneWidget,
          );

          // 5. While Human filter active, View Result preserves Business Pitch identity
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.humanViewResultLinkKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.evaluationResultHuman);
          expect(
            router.state.uri.queryParameters['track'],
            'business-pitch-sales-pitch',
          );
          expect(find.byType(EvaluationResultHumanScreen), findsOneWidget);
          expect(find.text('Business Pitch / Sales Pitch'), findsWidgets);

          // Return to history and test Human Download .docx link
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.approvedEvaluationHistory,
          );
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.filterHumanPillKey),
          );
          await tester.pumpAndSettle();

          await tester.tap(
            find.byKey(
              ApprovedEvaluationHistoryScreen.humanDownloadDocxLinkKey,
            ),
          );
          await tester.pumpAndSettle();
          expect(
            router.state.uri.path,
            AppRoutePaths.evaluationReportDownloadSimulated,
          );
        },
      );
    });

    group('4. Leaderboard Period State & Copy Matrix', () {
      testWidgets(
        'Verifies default All-Time provider state, monthly toggle on AI and Human, monthly copy with D = 1.00, and bidirectional period persistence',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.leaderboard);

          expect(router.state.uri.path, AppRoutePaths.leaderboard);

          final container = ProviderScope.containerOf(
            tester.element(find.byType(LeaderboardAiAllTimeScreen)),
          );

          // 1. Default provider state is All-Time
          expect(
            container.read(leaderboardPeriodProvider),
            LeaderboardPeriod.allTime,
          );
          expect(find.text('ALL-TIME AI RANKING'), findsOneWidget);
          expect(
            find.text('3 Approved AI evaluations in this scope.'),
            findsOneWidget,
          );

          // 2. All-Time -> Monthly on AI
          await tester.tap(
            find.byKey(LeaderboardAiAllTimeScreen.periodMonthlyPillKey),
          );
          await tester.pumpAndSettle();

          expect(
            container.read(leaderboardPeriodProvider),
            LeaderboardPeriod.monthly,
          );
          expect(find.text('MONTHLY AI RANKING'), findsOneWidget);
          expect(
            find.text(
              '3 Approved AI evaluations submitted this calendar month (D = 1.00).',
            ),
            findsOneWidget,
          );
          expect(find.text('ALR 94.0'), findsOneWidget);
          expect(find.text('Your position  #8'), findsOneWidget);

          // 3. Selected period persists AI -> Human
          await tester.tap(
            find.byKey(LeaderboardAiAllTimeScreen.modeHumanPillKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);
          expect(
            container.read(leaderboardPeriodProvider),
            LeaderboardPeriod.monthly,
          );
          expect(find.text('MONTHLY HUMAN RANKING'), findsOneWidget);
          expect(
            find.text(
              '2 of 3 Approved Human evaluations submitted this calendar month (D = 1.00).',
            ),
            findsOneWidget,
          );
          expect(find.text('ALR 93.0'), findsOneWidget);
          expect(
            find.text('1 more Approved Human evaluation required this month'),
            findsOneWidget,
          );

          // 4. Monthly -> All-Time on Human
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.periodAllTimePillKey),
          );
          await tester.pumpAndSettle();

          expect(
            container.read(leaderboardPeriodProvider),
            LeaderboardPeriod.allTime,
          );
          expect(find.text('ALL-TIME HUMAN RANKING'), findsOneWidget);
          expect(
            find.text('2 of 3 Approved Human evaluations in this scope.'),
            findsOneWidget,
          );

          // 5. Selected period persists Human -> AI
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.modeAiPillKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.leaderboard);
          expect(
            container.read(leaderboardPeriodProvider),
            LeaderboardPeriod.allTime,
          );
          expect(find.text('ALL-TIME AI RANKING'), findsOneWidget);
        },
      );
    });

    group('5. How Ranking Works Modal Lifecycles and Dismissals', () {
      testWidgets(
        'Verifies launch from AI All-Time, launch from Human Monthly with period retention, header back, and system pop',
        (tester) async {
          final router = await pumpAuratioApp(tester);

          // 1. Launch from AI All-Time and close with bottom CTA
          await openAuratioRoute(tester, router, AppRoutePaths.leaderboard);
          await tester.tap(
            find.byKey(LeaderboardAiAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();

          expect(find.byKey(HowRankingWorksModal.modalKey), findsOneWidget);

          await tester.tap(
            find.byKey(HowRankingWorksModal.backToLeaderboardButtonKey),
          );
          await tester.pumpAndSettle();

          expect(find.byKey(HowRankingWorksModal.modalKey), findsNothing);
          expect(
            find.byKey(LeaderboardAiAllTimeScreen.screenKey),
            findsOneWidget,
          );
          expect(find.text('ALL-TIME AI RANKING'), findsOneWidget);

          // 2. Open from Human Monthly and verify Human Monthly remains selected after close
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.leaderboardHuman,
          );
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.periodMonthlyPillKey),
          );
          await tester.pumpAndSettle();
          expect(find.text('MONTHLY HUMAN RANKING'), findsOneWidget);

          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();
          expect(find.byKey(HowRankingWorksModal.modalKey), findsOneWidget);

          await tester.tap(
            find.byKey(HowRankingWorksModal.backToLeaderboardButtonKey),
          );
          await tester.pumpAndSettle();

          expect(find.byKey(HowRankingWorksModal.modalKey), findsNothing);
          expect(
            find.byKey(LeaderboardHumanAllTimeScreen.screenKey),
            findsOneWidget,
          );
          expect(find.text('MONTHLY HUMAN RANKING'), findsOneWidget);

          // 3. Header Back closes modal
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();
          expect(find.byKey(HowRankingWorksModal.modalKey), findsOneWidget);

          await tester.tap(
            find.descendant(
              of: find.byKey(HowRankingWorksModal.modalKey),
              matching: find.text('‹'),
            ),
          );
          await tester.pumpAndSettle();

          expect(find.byKey(HowRankingWorksModal.modalKey), findsNothing);
          expect(find.text('MONTHLY HUMAN RANKING'), findsOneWidget);

          // 4. Simulate Android/system back and verify modal closes without leaving underlying route/period
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();
          expect(find.byKey(HowRankingWorksModal.modalKey), findsOneWidget);

          final didPop = await tester.binding.handlePopRoute();
          expect(didPop, isTrue);
          await tester.pumpAndSettle();

          expect(find.byKey(HowRankingWorksModal.modalKey), findsNothing);
          expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);
          expect(find.text('MONTHLY HUMAN RANKING'), findsOneWidget);
        },
      );
    });

    group('6. Accessibility Hardening Semantics Verification', () {
      testWidgets(
        'Tracks filter chips expose button, selected, and label semantics',
        (tester) async {
          final semantics = tester.ensureSemantics();
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.tracks);

          expect(
            tester.getSemantics(find.byKey(TracksScreen.filterAllChipKey)),
            isSemantics(
              label: 'All',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
              hasSelectedState: true,
              isSelected: true,
            ),
          );
          expect(
            tester.getSemantics(
              find.byKey(TracksScreen.filterPublicSpeakingChipKey),
            ),
            isSemantics(
              label: 'Public Speaking',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
              hasSelectedState: true,
              isSelected: false,
            ),
          );
          semantics.dispose();
        },
      );

      testWidgets(
        'Events filter pills expose button, enabled, and label semantics',
        (tester) async {
          final semantics = tester.ensureSemantics();
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.events);

          expect(
            tester.getSemantics(
              find.byKey(EventsDiscoveryScreen.filterDivisionKey),
            ),
            isSemantics(
              label: 'Division: Dhaka Division',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
            ),
          );
          expect(
            tester.getSemantics(
              find.byKey(EventsDiscoveryScreen.filterPathKey),
            ),
            isSemantics(
              label: 'Path: All Paths',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
            ),
          );
          expect(
            tester.getSemantics(
              find.byKey(EventsDiscoveryScreen.filterDateKey),
            ),
            isSemantics(
              label: 'Date: Upcoming',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
            ),
          );
          semantics.dispose();
        },
      );

      testWidgets(
        'Approved History filter pills expose button, selected, and label semantics',
        (tester) async {
          final semantics = tester.ensureSemantics();
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.approvedEvaluationHistory,
          );

          expect(
            tester.getSemantics(
              find.byKey(ApprovedEvaluationHistoryScreen.filterAllPillKey),
            ),
            isSemantics(
              label: 'All',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
              hasSelectedState: true,
              isSelected: true,
            ),
          );
          expect(
            tester.getSemantics(
              find.byKey(ApprovedEvaluationHistoryScreen.filterAiPillKey),
            ),
            isSemantics(
              label: 'AI',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
              hasSelectedState: true,
              isSelected: false,
            ),
          );
          semantics.dispose();
        },
      );

      testWidgets(
        'Leaderboard mode, period, and How Ranking Works controls expose interactive semantics',
        (tester) async {
          final semantics = tester.ensureSemantics();
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.leaderboard);

          // Mode pills on AI
          expect(
            tester.getSemantics(
              find.byKey(LeaderboardAiAllTimeScreen.modeAiPillKey),
            ),
            isSemantics(
              label: 'AI Leaderboard',
              isButton: true,
              hasEnabledState: true,
              isEnabled: false,
              hasSelectedState: true,
              isSelected: true,
            ),
          );
          expect(
            tester.getSemantics(
              find.byKey(LeaderboardAiAllTimeScreen.modeHumanPillKey),
            ),
            isSemantics(
              label: 'Human Leaderboard',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
              hasSelectedState: true,
              isSelected: false,
            ),
          );

          // Period pills on AI
          expect(
            tester.getSemantics(
              find.byKey(LeaderboardAiAllTimeScreen.periodAllTimePillKey),
            ),
            isSemantics(
              label: 'All-Time',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
              hasSelectedState: true,
              isSelected: true,
            ),
          );
          expect(
            tester.getSemantics(
              find.byKey(LeaderboardAiAllTimeScreen.periodMonthlyPillKey),
            ),
            isSemantics(
              label: 'Monthly',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
              hasSelectedState: true,
              isSelected: false,
            ),
          );

          // How Ranking Works button
          await tester.ensureVisible(
            find.byKey(LeaderboardAiAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();

          expect(
            tester.getSemantics(
              find.byKey(LeaderboardAiAllTimeScreen.howRankingWorksKey),
            ),
            isSemantics(
              label: 'How Ranking Works',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
            ),
          );

          // Open modal and check Back button semantics
          await tester.tap(
            find.byKey(LeaderboardAiAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();

          expect(
            tester.getSemantics(
              find.byKey(HowRankingWorksModal.backToLeaderboardButtonKey),
            ),
            isSemantics(
              label: 'Back to Leaderboard',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
            ),
          );

          semantics.dispose();
        },
      );
    });

    group('7. Events Filter Label Readability & Non-Truncation at 390x844', () {
      testWidgets(
        'Default canonical filter labels and state selections fit without ellipsis or truncation',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.events);

          // 1. Default canonical state: Dhaka Division, All Paths, Upcoming
          final divPara = tester.renderObject<RenderParagraph>(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterDivisionKey),
              matching: find.byType(RichText),
            ),
          );
          expect(divPara.didExceedMaxLines, isFalse);

          final pathPara = tester.renderObject<RenderParagraph>(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterPathKey),
              matching: find.byType(RichText),
            ),
          );
          expect(pathPara.didExceedMaxLines, isFalse);

          final datePara = tester.renderObject<RenderParagraph>(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterDateKey),
              matching: find.byType(RichText),
            ),
          );
          expect(datePara.didExceedMaxLines, isFalse);

          // 2. Select Public Speaking path -> fits cleanly without truncation
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Public Speaking'));
          await tester.pumpAndSettle();

          final pubSpeakingPara = tester.renderObject<RenderParagraph>(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterPathKey),
              matching: find.byType(RichText),
            ),
          );
          expect(pubSpeakingPara.didExceedMaxLines, isFalse);
          expect(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterPathKey),
              matching: find.text('Public Speaking'),
            ),
            findsOneWidget,
          );

          // 3. Select Professional Presenting path -> concise unambiguous label fits cleanly
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Professional Presenting'));
          await tester.pumpAndSettle();

          final profPresPara = tester.renderObject<RenderParagraph>(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterPathKey),
              matching: find.byType(RichText),
            ),
          );
          expect(profPresPara.didExceedMaxLines, isFalse);
          expect(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterPathKey),
              matching: find.text('Prof. Presenting'),
            ),
            findsOneWidget,
          );
          // Semantics still announces full authoritative name
          expect(
            tester.getSemantics(
              find.byKey(EventsDiscoveryScreen.filterPathKey),
            ),
            isSemantics(
              label: 'Path: Professional Presenting',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
            ),
          );

          // Reset path to All Paths
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('All Paths'));
          await tester.pumpAndSettle();

          // 4. Select Chattogram Division -> fits cleanly without truncation
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterDivisionKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Chattogram Division'));
          await tester.pumpAndSettle();

          final chattogramPara = tester.renderObject<RenderParagraph>(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterDivisionKey),
              matching: find.byType(RichText),
            ),
          );
          expect(chattogramPara.didExceedMaxLines, isFalse);
          expect(
            find.descendant(
              of: find.byKey(EventsDiscoveryScreen.filterDivisionKey),
              matching: find.text('Chattogram Division'),
            ),
            findsOneWidget,
          );
          expect(
            tester.getSemantics(
              find.byKey(EventsDiscoveryScreen.filterDivisionKey),
            ),
            isSemantics(
              label: 'Division: Chattogram Division',
              isButton: true,
              hasEnabledState: true,
              isEnabled: true,
            ),
          );
        },
      );
    });
  });
}
