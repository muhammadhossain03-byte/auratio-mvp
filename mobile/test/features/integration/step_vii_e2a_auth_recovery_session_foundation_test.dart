import 'dart:io';

import 'package:auratio_mobile/features/authentication/data/auth_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E2A auth recovery/session foundation', () {
    test('repository contract exposes recovery and auth-change boundaries', () {
      final source = File(
        'lib/features/authentication/data/auth_repository.dart',
      ).readAsStringSync();

      expect(source, contains('requestPasswordReset'));
      expect(source, contains('updatePassword'));
      expect(source, contains('Stream<void> authChanges()'));
    });

    test('Supabase implementation uses Auth-owned recovery APIs', () {
      final source = File(
        'lib/features/authentication/data/auth_repository.dart',
      ).readAsStringSync();

      expect(source, contains('.auth.resetPasswordForEmail('));
      expect(source, contains('redirectTo: redirectTo'));
      expect(
        source,
        contains('.auth.updateUser(UserAttributes(password: newPassword))'),
      );
      expect(source, contains('.auth.onAuthStateChange.map'));
    });

    test('password mutation is validated before provider invocation', () {
      final source = File(
        'lib/features/authentication/data/auth_repository.dart',
      ).readAsStringSync();

      expect(source, contains('if (newPassword.length < 8)'));
      expect(source, contains("'password_reset_password_invalid'"));
    });

    test('unconfigured repository remains fail-closed for recovery', () async {
      const repository = UnconfiguredAuratioAuthRepository();

      expect(repository.isConfigured, isFalse);
      await expectLater(
        repository.requestPasswordReset(email: 'user@example.com'),
        throwsA(isA<AuratioAuthenticationException>()),
      );
      await expectLater(
        repository.updatePassword(newPassword: 'password123'),
        throwsA(isA<AuratioAuthenticationException>()),
      );
      expect(await repository.authChanges().toList(), isEmpty);
    });

    test('no privileged client credential or service RPC is introduced', () {
      final source = File(
        'lib/features/authentication/data/auth_repository.dart',
      ).readAsStringSync();

      expect(source, isNot(contains('SUPABASE_SERVICE_ROLE_KEY')));
      expect(source, isNot(contains('service_role')));
      expect(source, isNot(contains('svc_')));
    });
  });
}
