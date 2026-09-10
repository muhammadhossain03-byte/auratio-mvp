import 'package:auratio_mobile/features/authentication/application/auth_redirects.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('native signup confirmation returns to Email Verified', () {
    expect(
      AuratioAuthRedirects.nativeSignUpConfirmation,
      'cloud.auratio://login-callback/auth/email-verified',
    );
  });

  test('native password recovery returns to Reset Password', () {
    expect(
      AuratioAuthRedirects.nativePasswordRecovery,
      'cloud.auratio://login-callback/auth/reset-password',
    );
  });

  test('signup and recovery deep links are distinct', () {
    expect(
      AuratioAuthRedirects.nativeSignUpConfirmation,
      isNot(AuratioAuthRedirects.nativePasswordRecovery),
    );
  });
}
