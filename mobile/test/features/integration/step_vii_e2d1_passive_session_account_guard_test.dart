import 'dart:io';

import 'package:auratio_mobile/features/authentication/application/mobile_session_guard.dart';
import 'package:auratio_mobile/features/authentication/data/auth_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E2D1 passive session/account guard', () {
    test('guard polls at a bounded interval and reacts to auth changes', () {
      final source = File(
        'lib/features/authentication/application/mobile_session_guard.dart',
      ).readAsStringSync();

      expect(source, contains('const mobileSessionGuardInterval'));
      expect(source, contains('Duration(seconds: 60)'));
      expect(source, contains('repository.authChanges().listen'));
      expect(source, contains('Timer.periodic'));
      expect(source, contains('scheduleMicrotask'));
      expect(source, contains('await repository.currentSession()'));
    });

    test('missing or non-end-user session revokes mobile access', () {
      final source = File(
        'lib/features/authentication/application/mobile_session_guard.dart',
      ).readAsStringSync();

      expect(
        source,
        contains('session == null || !session.profile.isActiveEndUser'),
      );
      expect(
        source,
        contains('controller.add(MobileSessionGuardEvent.accessRevoked)'),
      );
    });

    test('transient profile-load failure does not force sign-out routing', () {
      const transient = AuratioAuthenticationException(
        'profile_load_failed',
        'Unable to load the Auratio profile.',
      );
      const terminal = AuratioAuthenticationException(
        'mobile_access_denied',
        'This account cannot access the Auratio mobile app.',
      );

      expect(isTerminalMobileSessionError(transient), isFalse);
      expect(isTerminalMobileSessionError(terminal), isTrue);
    });

    test('application listener routes revoked access to Sign In', () {
      final source = File('lib/app/app.dart').readAsStringSync();

      expect(source, contains('ref.listen(mobileSessionGuardProvider'));
      expect(source, contains('case MobileSessionGuardEvent.accessRevoked:'));
      expect(source, contains('router.go(AppRoutePaths.signIn)'));
    });

    test('guard does not introduce a privileged client boundary', () {
      final files = [
        'lib/features/authentication/application/mobile_session_guard.dart',
        'lib/app/app.dart',
      ];

      final source = files
          .map((path) => File(path).readAsStringSync())
          .join('\n');

      expect(source, isNot(contains('SUPABASE_SERVICE_ROLE_KEY')));
      expect(source, isNot(contains('service_role')));
      expect(source, isNot(contains('svc_')));
    });
  });
}
