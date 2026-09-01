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
import '../../features/foundation/presentation/foundation_page.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/onboarding/presentation/screens/choose_paths_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_intro_screen.dart';
import '../../features/submissions/presentation/screens/checking_recording_screen.dart';
import '../../features/submissions/presentation/screens/recording_accepted_screen.dart';
import '../../features/submissions/presentation/screens/submission_requirements_screen.dart';
import '../../features/submissions/presentation/screens/upload_recording_screen.dart';
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
        builder: (context, state) => const TrackDetailsScreen(),
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
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationResultAiScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutePaths.evaluationResultHuman,
        pageBuilder: (context, state) => _dissolvePage(
          key: state.pageKey,
          child: const EvaluationResultHumanScreen(),
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
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});
