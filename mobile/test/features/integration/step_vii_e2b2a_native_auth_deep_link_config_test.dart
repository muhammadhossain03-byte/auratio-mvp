import 'dart:io';

import 'package:auratio_mobile/features/authentication/application/auth_redirects.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E2B2A native auth deep-link configuration', () {
    test('native password recovery callback is stable and app-owned', () {
      expect(
        AuratioAuthRedirects.nativeCallback,
        'cloud.auratio://login-callback/',
      );
    });

    test(
      'password recovery request screens send an explicit redirect target',
      () {
        final forgot = File(
          'lib/features/authentication/presentation/screens/forgot_password_screen.dart',
        ).readAsStringSync();
        final sent = File(
          'lib/features/authentication/presentation/screens/reset_link_sent_screen.dart',
        ).readAsStringSync();

        expect(
          forgot,
          contains('redirectTo: AuratioAuthRedirects.passwordRecovery'),
        );
        expect(
          sent,
          contains('redirectTo: AuratioAuthRedirects.passwordRecovery'),
        );
      },
    );

    test(
      'Android registers callback scheme and release network permission',
      () {
        final source = File('android/app/src/main/AndroidManifest.xml')
            .readAsStringSync();

        expect(source, contains('android.permission.INTERNET'));
        expect(source, contains('android.intent.action.VIEW'));
        expect(source, contains('android.intent.category.BROWSABLE'));
        expect(source, contains('android:scheme="cloud.auratio"'));
        expect(source, contains('android:host="login-callback"'));
      },
    );

    test('iOS registers the same callback scheme', () {
      final source = File('ios/Runner/Info.plist').readAsStringSync();

      expect(source, contains('<key>CFBundleURLTypes</key>'));
      expect(source, contains('<key>CFBundleURLSchemes</key>'));
      expect(source, contains('<string>cloud.auratio</string>'));
    });

    test('no privileged client boundary is introduced', () {
      final files = [
        'lib/features/authentication/application/auth_redirects.dart',
        'lib/features/authentication/presentation/screens/forgot_password_screen.dart',
        'lib/features/authentication/presentation/screens/reset_link_sent_screen.dart',
        'android/app/src/main/AndroidManifest.xml',
        'ios/Runner/Info.plist',
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
