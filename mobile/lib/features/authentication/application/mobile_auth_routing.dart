import 'dart:async';

import '../../../../app/router/app_route_paths.dart';
import '../data/auth_repository.dart';

bool isPublicMobileAuthenticationPath(String path) {
  return path == AppRoutePaths.foundation ||
      path == AppRoutePaths.authentication ||
      path.startsWith('${AppRoutePaths.authentication}/');
}

FutureOr<String?> mobileAuthRedirect(
  AuratioAuthRepository repository,
  String path,
) {
  if (!repository.isConfigured || isPublicMobileAuthenticationPath(path)) {
    return null;
  }

  return _configuredMobileAuthRedirect(repository);
}

Future<String?> _configuredMobileAuthRedirect(
  AuratioAuthRepository repository,
) async {
  try {
    final session = await repository.currentSession();
    if (session == null) return AppRoutePaths.signIn;

    if (!session.profile.isActiveEndUser) {
      try {
        await repository.signOut();
      } catch (_) {
        // Route denial must still win if best-effort cleanup cannot complete.
      }
      return AppRoutePaths.signIn;
    }

    return null;
  } on AuratioAuthenticationException {
    return AppRoutePaths.signIn;
  }
}
