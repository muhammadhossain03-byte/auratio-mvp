import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/create_account_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/forgot_password_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/sign_in_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_pending_moderation_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_routing_screen.dart';
import 'package:auratio_mobile/features/events/presentation/screens/event_details_screen.dart';
import 'package:auratio_mobile/features/events/presentation/screens/events_discovery_screen.dart';
import 'package:auratio_mobile/features/home/presentation/screens/home_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/settings_screen.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/approved_evaluation_history_screen.dart';
import 'package:auratio_mobile/features/tracks/domain/track_catalog.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/track_details_screen.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_navigation.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('AURATIO STEP IV — MOBILE INTERACTION REPAIR R2A', () {
    testWidgets(
      '1. Home — View Active Evaluation navigates to Pending Moderation',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, AppRoutePaths.home);

        expect(router.state.uri.path, AppRoutePaths.home);
        expect(find.byKey(HomeScreen.viewActiveEvaluationKey), findsOneWidget);

        await tester.tap(find.byKey(HomeScreen.viewActiveEvaluationKey));
        await tester.pumpAndSettle();

        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationStatusPendingModeration,
        );
        expect(
          find.byKey(EvaluationPendingModerationScreen.screenKey),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      '2. Events Discovery — Bottom Navigation Home returns to /home',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, AppRoutePaths.events);

        expect(router.state.uri.path, AppRoutePaths.events);
        expect(find.byKey(EventsDiscoveryScreen.screenKey), findsOneWidget);

        // Tap Home on Events Discovery bottom nav
        await tester.tap(
          find.widgetWithText(AuratioMobileNavigationItem, 'Home'),
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.home);
        expect(find.byType(HomeScreen), findsOneWidget);

        // Re-open Events and verify Tracks, Progress, Profile still navigate correctly
        await openAuratioRoute(tester, router, AppRoutePaths.events);
        await tester.tap(
          find.widgetWithText(AuratioMobileNavigationItem, 'Tracks'),
        );
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.tracks);

        await openAuratioRoute(tester, router, AppRoutePaths.events);
        await tester.tap(
          find.widgetWithText(AuratioMobileNavigationItem, 'Progress'),
        );
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.progress);

        await openAuratioRoute(tester, router, AppRoutePaths.events);
        await tester.tap(
          find.widgetWithText(AuratioMobileNavigationItem, 'Profile'),
        );
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.profile);
      },
    );

    testWidgets(
      '3. Settings — Sign Out button is interactive and navigates to Sign In',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, AppRoutePaths.profileSettings);

        expect(router.state.uri.path, AppRoutePaths.profileSettings);
        expect(find.byKey(SettingsScreen.signOutVisualKey), findsOneWidget);

        await tester.tap(find.byKey(SettingsScreen.signOutVisualKey));
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.signIn);
        expect(find.byType(SignInScreen), findsOneWidget);
      },
    );

    group('4. Dead Header Back Affordances', () {
      testWidgets('A. EvaluationPendingModerationScreen Back -> Home', (
        tester,
      ) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationStatusPendingModeration,
        );

        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationStatusPendingModeration,
        );
        final backButton = find.bySemanticsLabel('Back');
        expect(backButton, findsOneWidget);

        await tester.tap(backButton);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.home);
      });

      testWidgets(
        'B1. EvaluationProcessingScreen AI Back -> routingAssignedAi',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.evaluationProcessingAi,
            settle: false,
          );
          await tester.pump(const Duration(milliseconds: 200));

          expect(router.state.uri.path, AppRoutePaths.evaluationProcessingAi);
          final backButton = find.bySemanticsLabel('Back');
          expect(backButton, findsOneWidget);

          await tester.tap(backButton);
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.routingAssignedAi);
          expect(
            find.byKey(EvaluationRoutingScreen.aiScreenKey),
            findsOneWidget,
          );
        },
      );

      testWidgets(
        'B2. EvaluationProcessingScreen Human Back -> routingAssignedHuman',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.evaluationProcessingHuman,
            settle: false,
          );
          await tester.pump(const Duration(milliseconds: 200));

          expect(
            router.state.uri.path,
            AppRoutePaths.evaluationProcessingHuman,
          );
          final backButton = find.bySemanticsLabel('Back');
          expect(backButton, findsOneWidget);

          await tester.tap(backButton);
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.routingAssignedHuman);
          expect(
            find.byKey(EvaluationRoutingScreen.humanScreenKey),
            findsOneWidget,
          );
        },
      );

      testWidgets('C. VerifyEmailScreen Back -> createAccount', (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, AppRoutePaths.verifyEmail);

        expect(router.state.uri.path, AppRoutePaths.verifyEmail);
        final backButton = find.bySemanticsLabel('Back');
        expect(backButton, findsOneWidget);

        await tester.tap(backButton);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.createAccount);
        expect(find.byKey(CreateAccountScreen.screenKey), findsOneWidget);
      });

      testWidgets('D. ResetLinkSentScreen Back -> forgotPassword', (
        tester,
      ) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, AppRoutePaths.resetLinkSent);

        expect(router.state.uri.path, AppRoutePaths.resetLinkSent);
        final backButton = find.bySemanticsLabel('Back');
        expect(backButton, findsOneWidget);

        await tester.tap(backButton);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.forgotPassword);
        expect(find.byKey(ForgotPasswordScreen.screenKey), findsOneWidget);
      });
    });

    group('5. Event Details Parameterization', () {
      testWidgets(
        'Event 1 opens Public Speaking Summit details with correct content',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.events);

          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );

          await tester.tap(find.byKey(EventsDiscoveryScreen.eventCard1Key));
          await tester.pumpAndSettle();

          expect(router.state.uri.path, '/events/public-speaking-summit');
          expect(find.text('Public Speaking Summit'), findsOneWidget);
          expect(find.text('Public Speaking'), findsOneWidget);
          expect(
            find.text(
              'Shown because your saved Division and selected Public Speaking path match this event.',
            ),
            findsOneWidget,
          );

          // Back to events button works
          await tester.tap(
            find.byKey(EventDetailsScreen.backToEventsButtonKey),
          );
          await tester.pumpAndSettle();
          expect(router.state.uri.path, AppRoutePaths.events);
        },
      );

      testWidgets(
        'Event 2 opens Presentation Practice Meetup details with correct content',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.events);

          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );

          await tester.tap(find.byKey(EventsDiscoveryScreen.eventCard2Key));
          await tester.pumpAndSettle();

          expect(router.state.uri.path, '/events/presentation-practice-meetup');
          expect(find.text('Presentation Practice Meetup'), findsOneWidget);
          expect(find.text('Professional Presenting'), findsOneWidget);
          expect(
            find.text(
              'Shown because your saved Division and selected Professional Presenting path match this event.',
            ),
            findsOneWidget,
          );
        },
      );

      testWidgets('Canonical /events/details fallback opens Summit', (
        tester,
      ) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, AppRoutePaths.eventDetails);

        expect(router.state.uri.path, AppRoutePaths.eventDetails);
        expect(find.text('Public Speaking Summit'), findsOneWidget);
      });

      testWidgets('Invalid event slug redirects safely to /events', (
        tester,
      ) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, '/events/non-existent-event');

        expect(router.state.uri.path, AppRoutePaths.events);
        expect(find.byKey(EventsDiscoveryScreen.screenKey), findsOneWidget);
      });
    });

    group('6. Fix Historical Result Track Contamination', () {
      testWidgets(
        'Historical AI result preserves Business Pitch regardless of active track selection',
        (tester) async {
          final router = await pumpAuratioApp(tester);

          // Select Marketing / Promotional as the current active track
          await openAuratioRoute(
            tester,
            router,
            '/tracks/marketing-promotional',
          );
          expect(router.state.uri.path, '/tracks/marketing-promotional');
          await tester.tap(
            find.byKey(TrackDetailsScreen.startEvaluationButtonKey),
          );
          await tester.pumpAndSettle();

          // Navigate to Approved Evaluation History
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.approvedEvaluationHistory,
          );
          expect(
            router.state.uri.path,
            AppRoutePaths.approvedEvaluationHistory,
          );

          // Tap AI View Result link
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.aiViewResultLinkKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);
          expect(
            router.state.uri.queryParameters['track'],
            'business-pitch-sales-pitch',
          );

          // Heading MUST be Business Pitch / Sales Pitch, NOT Marketing / Promotional
          expect(
            find.text(AuratioTrackCatalog.businessPitch.name),
            findsOneWidget,
          );
          expect(
            find.text(AuratioTrackCatalog.marketingPromotional.name),
            findsNothing,
          );
        },
      );

      testWidgets(
        'Historical Human result preserves Business Pitch regardless of active track selection',
        (tester) async {
          final router = await pumpAuratioApp(tester);

          // Select Marketing / Promotional as the current active track
          await openAuratioRoute(
            tester,
            router,
            '/tracks/marketing-promotional',
          );
          expect(router.state.uri.path, '/tracks/marketing-promotional');
          await tester.tap(
            find.byKey(TrackDetailsScreen.startEvaluationButtonKey),
          );
          await tester.pumpAndSettle();

          // Navigate to Approved Evaluation History
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.approvedEvaluationHistory,
          );

          // Tap Human View Result link
          await tester.tap(
            find.byKey(ApprovedEvaluationHistoryScreen.humanViewResultLinkKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.evaluationResultHuman);
          expect(
            router.state.uri.queryParameters['track'],
            'business-pitch-sales-pitch',
          );

          // Heading MUST be Business Pitch / Sales Pitch, NOT Marketing / Promotional
          expect(
            find.text(AuratioTrackCatalog.businessPitch.name),
            findsOneWidget,
          );
          expect(
            find.text(AuratioTrackCatalog.marketingPromotional.name),
            findsNothing,
          );
        },
      );

      testWidgets(
        'Current active evaluation result uses selectedTrackProvider when no explicit track is passed',
        (tester) async {
          final router = await pumpAuratioApp(tester);

          // Set Informative as current track
          await openAuratioRoute(tester, router, '/tracks/informative');
          await tester.tap(
            find.byKey(TrackDetailsScreen.startEvaluationButtonKey),
          );
          await tester.pumpAndSettle();

          // Directly open evaluationResultAi without query parameter (simulating active journey)
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.evaluationResultAi,
          );

          expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);
          expect(router.state.uri.queryParameters['track'], isNull);
          expect(
            find.text(AuratioTrackCatalog.informative.name),
            findsOneWidget,
          );
        },
      );

      testWidgets('Invalid historical track query parameter safely redirects', (
        tester,
      ) async {
        final router = await pumpAuratioApp(tester);

        await openAuratioRoute(
          tester,
          router,
          '/evaluations/result/ai?track=invalid-track-slug',
        );

        // Redirects safely to approved history rather than resolving to another track
        expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);
        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.screenKey),
          findsOneWidget,
        );
      });
    });
  });
}
