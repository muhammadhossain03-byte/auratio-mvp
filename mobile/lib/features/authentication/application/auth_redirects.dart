import 'package:flutter/foundation.dart';

import '../../../app/router/app_route_paths.dart';

abstract final class AuratioAuthRedirects {
  static const nativeCallback = 'cloud.auratio://login-callback/';

  static String get passwordRecovery {
    if (kIsWeb) {
      return Uri.base.resolve(AppRoutePaths.resetPassword).toString();
    }
    return nativeCallback;
  }
}
