import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/authentication/presentation/screens/create_account_screen.dart';
import '../../features/authentication/presentation/screens/email_verified_screen.dart';
import '../../features/authentication/presentation/screens/forgot_password_screen.dart';
import '../../features/authentication/presentation/screens/password_reset_complete_screen.dart';
import '../../features/authentication/presentation/screens/reset_link_sent_screen.dart';
import '../../features/authentication/presentation/screens/reset_password_screen.dart';
import '../../features/authentication/presentation/screens/sign_in_screen.dart';
import '../../features/authentication/presentation/screens/verify_email_screen.dart';
import '../../features/evaluations/domain/evaluation_method.dart';
import '../../features/evaluations/presentation/screens/choose_evaluation_method_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_pending_moderation_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_processing_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_rejected_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_report_download_simulated_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_report_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_result_human_screen.dart';
import '../../features/evaluations/presentation/screens/evaluation_routing_screen.dart';
import '../../features/events/domain/event_catalog.dart';
import '../../features/events/presentation/screens/event_details_screen.dart';
import '../../features/events/presentation/screens/events_discovery_screen.dart';
import '../../features/foundation/presentation/foundation_page.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/leaderboard/presentation/screens/leaderboard_ai_all_time_screen.dart';
import '../../features/leaderboard/presentation/screens/leaderboard_human_all_time_screen.dart';
import '../../features/onboarding/presentation/screens/choose_paths_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_intro_screen.dart';
import '../../features/profile/presentation/screens/manage_paths_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/settings_screen.dart';
import '../../features/progress/presentation/screens/approved_evaluation_history_screen.dart';
import '../../features/progress/presentation/screens/private_progress_screen.dart';
import '../../features/submissions/presentation/screens/checking_recording_screen.dart';
import '../../features/submissions/presentation/screens/recording_accepted_screen.dart';
import '../../features/submissions/presentation/screens/submission_requirements_screen.dart';
import '../../features/submissions/presentation/screens/upload_recording_screen.dart';
import '../../features/tracks/domain/track_catalog.dart';
import '../../features/tracks/presentation/screens/track_details_screen.dart';
import '../../features/tracks/presentation/screens/tracks_screen.dart';
import 'app_route_paths.dart';

Page<dynamic> _dissolvePage({required LocalKey key, required Widget child}) {
  return CustomTransitionPage<void>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 150),
    reverseTransitionDuration: const Duration(milliseconds: 150),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curvedAnimation = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOut,
      );
      return FadeTransition(opacity: curvedAnimation, child: child);
    },
  );
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    routes: [
      GoRoute(
        path: AppRoutePaths.foundation,
        redirect: (context, state) => AppRoutePaths.signIn,
      ),
      GoRoute(
        path: '/foundation',
        builder: (context, state) => const FoundationPage(),
      ),
      GoRoute(
        path: AppRoutePaths.signIn,
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.createAccount,
        builder: (context, state) => const CreateAccountScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.verifyEmail,
        builder: (context, state) => const VerifyEmailScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.emailVerified,
        builder: (context, state) => const EmailVerifiedScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.onboardingIntro,
        builder: (context, state) => const OnboardingIntroScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.choosePaths,
        builder: (context, state) => const ChoosePathsScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.signInNewAccount,
        builder: (context, state) => const SignInScreen.newAccount(),
      ),
      GoRoute(
        path: AppRoutePaths.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.resetLinkSent,
        builder: (context, state) => const ResetLinkSentScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.resetPassword,
        builder: (context, state) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.passwordResetComplete,
        builder: (context, state) => const PasswordResetCompleteScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.tracks,
        builder: (context, state) => const TracksScreen(),
      ),
      GoRoute(
        path: AppRoutePaths.trackDetails,
        builder: (context, state) =>
            const TrackDetailsScreen(slug: 'business-pitch-sales-pitch'),
      ),
      GoRoute(
        path: '/tracks/:slug',
        redirect: (context, state) {
          final slug = state.pathParameters['slug'];
          if (slug == null || AuratioTrackCatalog.findBySlug(slug) == null) {
            return AppRoutePaths.tracks;
          }
          return null;
        },
        builder: (context, state) =>
            TrackDetailsScreen(slug: state.pathParameters['slug']),
      ),
      GoRoute(
        path: AppRoutePaths.submissionRequirements,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const SubmissionRequirementsScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.uploadRecording,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const UploadRecordingScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.checkingRecording,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const CheckingRecordingScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.recordingAccepted,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const RecordingAcceptedScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.chooseEvaluationMethod,
        pageBuilder: (context, state) {
          final methodParam = state.uri.queryParameters['method'];
          final initialMethod = methodParam == 'human'
              ? EvaluationMethod.human
              : methodParam == 'ai'
              ? EvaluationMethod.ai
              : null;
          return _dissolvePage(
            key: state.pageKey,
            child: ChooseEvaluationMethodScreen(initialMethod: initialMethod),
          );
        },
      ),
      GoRoute(
        path: AppRoutePaths.routingAssignedAi,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationRoutingScreen(method: EvaluationMethod.ai),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.routingAssignedHuman,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationRoutingScreen(method: EvaluationMethod.human),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationProcessingAi,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationProcessingScreen(method: EvaluationMethod.ai),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationProcessingHuman,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationProcessingScreen(
            method: EvaluationMethod.human,
          ),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationResultAi,
        redirect: (context, state) {
          final trackParam = state.uri.queryParameters['track'];
          if (trackParam != null &&
              AuratioTrackCatalog.findBySlug(trackParam) == null) {
            return AppRoutePaths.approvedEvaluationHistory;
          }
          return null;
        },
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: EvaluationResultAiScreen(
            trackSlug: state.uri.queryParameters['track'],
          ),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationResultHuman,
        redirect: (context, state) {
          final trackParam = state.uri.queryParameters['track'];
          if (trackParam != null &&
              AuratioTrackCatalog.findBySlug(trackParam) == null) {
            return AppRoutePaths.approvedEvaluationHistory;
          }
          return null;
        },
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: EvaluationResultHumanScreen(
            trackSlug: state.uri.queryParameters['track'],
          ),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationReport,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationReportScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationReportDownloadSimulated,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationReportDownloadSimulatedScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationStatusPendingModeration,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationPendingModerationScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationStatusRejected,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationRejectedScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.progress,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const PrivateProgressScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.approvedEvaluationHistory,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const ApprovedEvaluationHistoryScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.leaderboard,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const LeaderboardAiAllTimeScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.leaderboardHuman,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const LeaderboardHumanAllTimeScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.events,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EventsDiscoveryScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.eventDetails,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EventDetailsScreen(slug: 'public-speaking-summit'),
        ),
      ),
      GoRoute(
        path: '/events/:slug',
        redirect: (context, state) {
          final slug = state.pathParameters['slug'];
          if (slug == null || AuratioEventCatalog.findBySlug(slug) == null) {
            return AppRoutePaths.events;
          }
          return null;
        },
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: EventDetailsScreen(slug: state.pathParameters['slug']),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.profile,
        pageBuilder: (context, state) =>
            _dissolvePage(key: state.pageKey, child: const ProfileScreen()),
      ),
      GoRoute(
        path: AppRoutePaths.profileThreePaths,
        pageBuilder: (context, state) =>
            _dissolvePage(key: state.pageKey, child: const ProfileScreen()),
      ),
      GoRoute(
        path: AppRoutePaths.profileSettings,
        pageBuilder: (context, state) =>
            _dissolvePage(key: state.pageKey, child: const SettingsScreen()),
      ),
      GoRoute(
        path: AppRoutePaths.managePaths,
        pageBuilder: (context, state) =>
            _dissolvePage(key: state.pageKey, child: const ManagePathsScreen()),
      ),
      GoRoute(
        path: AppRoutePaths.managePathsContentAdded,
        pageBuilder: (context, state) =>
            _dissolvePage(key: state.pageKey, child: const ManagePathsScreen()),
      ),
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});
