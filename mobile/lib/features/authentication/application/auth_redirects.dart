import 'package:flutter/foundation.dart';

import '../../../app/router/app_route_paths.dart';

abstract final class AuratioAuthRedirects {
  static const nativeCallback = 'cloud.auratio://login-callback/';

  static const nativeSignUpConfirmation =
      'cloud.auratio://login-callback/auth/email-verified';

  static const nativePasswordRecovery =
      'cloud.auratio://login-callback/auth/reset-password';

  static String get signUpConfirmation {
    if (kIsWeb) {
      return Uri.base.resolve(AppRoutePaths.emailVerified).toString();
    }

    return nativeSignUpConfirmation;
  }

  static String get passwordRecovery {
    if (kIsWeb) {
      return Uri.base.resolve(AppRoutePaths.resetPassword).toString();
    }

    return nativePasswordRecovery;
  }
}
