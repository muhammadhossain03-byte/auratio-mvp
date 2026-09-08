import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E2B1 configured password-recovery UI wiring', () {
    test('Forgot Password calls the configured auth repository', () {
      final source = File(
        'lib/features/authentication/presentation/screens/forgot_password_screen.dart',
      ).readAsStringSync();

      expect(source, contains('ref.read(authRepositoryProvider)'));
      expect(source, contains('await repository.requestPasswordReset'));
      expect(source, contains('if (!repository.isConfigured)'));
      expect(source, contains('mockPasswordRecoveryProvider'));
    });

    test(
      'configured Link Sent waits for email instead of simulating a link',
      () {
        final source = File(
          'lib/features/authentication/presentation/screens/reset_link_sent_screen.dart',
        ).readAsStringSync();

        expect(source, contains('late final bool _configured'));
        expect(source, contains('if (!_configured)'));
        expect(source, contains('Timer(ResetLinkSentScreen.transitionDelay'));
        expect(source, contains('await repository.requestPasswordReset'));
      },
    );

    test('Reset Password updates through the configured auth repository', () {
      final source = File(
        'lib/features/authentication/presentation/screens/reset_password_screen.dart',
      ).readAsStringSync();

      expect(source, contains('ConsumerStatefulWidget'));
      expect(source, contains('ref.read(authRepositoryProvider)'));
      expect(source, contains('await repository.updatePassword'));
      expect(source, contains('if (!repository.isConfigured)'));
    });

    test('configured failures are surfaced without privileged client code', () {
      final files = [
        'lib/features/authentication/presentation/screens/forgot_password_screen.dart',
        'lib/features/authentication/presentation/screens/reset_link_sent_screen.dart',
        'lib/features/authentication/presentation/screens/reset_password_screen.dart',
      ];

      final source = files
          .map((path) => File(path).readAsStringSync())
          .join('\n');

      expect(source, contains('AuratioAuthenticationException'));
      expect(source, isNot(contains('SUPABASE_SERVICE_ROLE_KEY')));
      expect(source, isNot(contains('service_role')));
      expect(source, isNot(contains('svc_')));
    });
  });
}
