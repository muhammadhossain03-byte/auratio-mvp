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
import '../../features/foundation/presentation/foundation_page.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/onboarding/presentation/screens/choose_paths_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_intro_screen.dart';
import '../../features/submissions/presentation/screens/submission_requirements_screen.dart';
import '../../features/tracks/presentation/screens/track_details_screen.dart';
import '../../features/tracks/presentation/screens/tracks_screen.dart';
import 'app_route_paths.dart';

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
        builder: (context, state) => const SubmissionRequirementsScreen(),
      ),
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});
