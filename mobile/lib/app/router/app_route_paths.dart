abstract final class AppRoutePaths {
  static const foundation = '/';

  // Reserved route groups for the locked mobile journey. Feature routes are
  // registered only when their corresponding Step IV screens are implemented.
  static const authentication = '/auth';
  static const signIn = '$authentication/sign-in';
  static const createAccount = '$authentication/create-account';
  static const verifyEmail = '$authentication/verify-email';
  static const emailVerified = '$authentication/email-verified';
  static const signInNewAccount = '$authentication/sign-in-new-account';
  static const forgotPassword = '$authentication/forgot-password';
  static const resetLinkSent = '$authentication/reset-link-sent';
  static const resetPassword = '$authentication/reset-password';
  static const passwordResetComplete =
      '$authentication/password-reset-complete';

  static const onboarding = '/onboarding';
  static const onboardingIntro = '$onboarding/intro';
  static const choosePaths = '$onboarding/choose-paths';

  static const home = '/home';
  static const tracks = '/tracks';
  static const trackDetails = '$tracks/business-pitch-sales-pitch';
  static const submissionRequirements = '/submissions/requirements';
  static const uploadRecording = '/submissions/upload-recording';
  static const checkingRecording = '/submissions/checking-recording';
  static const recordingAccepted = '/submissions/recording-accepted';
  static const submissions = '/submissions';
  static const evaluations = '/evaluations';
  static const chooseEvaluationMethod = '$evaluations/choose-method';
  static const routingAssignedAi = '$evaluations/routing/assigned-ai';
  static const routingAssignedHuman = '$evaluations/routing/assigned-human';
  static const evaluationProcessingAi = '$evaluations/processing/ai';
  static const evaluationProcessingHuman = '$evaluations/processing/human';
  static const evaluationResultAi = '$evaluations/result/ai';
  static const evaluationResultHuman = '$evaluations/result/human';
  static const evaluationReport = '$evaluations/report';
  static const evaluationReportDownloadSimulated =
      '$evaluations/report/download-simulated';
  static const evaluationStatusPendingModeration =
      '$evaluations/status/pending-moderation';
  static const evaluationStatusRejected = '$evaluations/status/rejected';
  static const progress = '/progress';
  static const approvedEvaluationHistory = '$progress/approved-history';
  static const leaderboard = '/leaderboard';
  static const leaderboardHuman = '$leaderboard/human';
  static const events = '/events';
  static const eventDetails = '$events/details';
  static const profile = '/profile';
}
