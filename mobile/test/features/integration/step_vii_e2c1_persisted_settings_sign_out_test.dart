import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E2C1 persisted settings and sign-out', () {
    test('SettingsScreen accepts persisted email and async sign-out', () {
      final source = File(
        'lib/features/profile/presentation/screens/settings_screen.dart',
      ).readAsStringSync();

      expect(source, contains("this.email = 'alex@example.com'"));
      expect(source, contains('final Future<void> Function()? onSignOut'));
      expect(source, contains("'Email: \${widget.email}'"));
      expect(source, contains('await onSignOut()'));
      expect(source, contains('_signingOut ? null : _handleSignOut'));
    });

    test('unconfigured Settings keeps prototype navigation fallback', () {
      final source = File(
        'lib/features/profile/presentation/screens/settings_screen.dart',
      ).readAsStringSync();

      expect(source, contains('if (onSignOut == null)'));
      expect(source, contains('context.go(AppRoutePaths.signIn)'));
    });

    test(
      'persisted wrapper loads account identity and calls real sign-out',
      () {
        final source = File(
          'lib/features/profile/presentation/screens/persisted_profile_route_screens.dart',
        ).readAsStringSync();

        expect(source, contains('class PersistedSettingsRouteScreen'));
        expect(source, contains('email: value.email'));
        expect(source, contains('ref.read(authRepositoryProvider).signOut()'));
        expect(
          source,
          contains('ref.invalidate(persistedEndUserProfileProvider)'),
        );
        expect(
          source,
          contains('ref.invalidate(persistedSelectedPathsProvider)'),
        );
      },
    );

    test('configured router selects persisted settings wrapper', () {
      final source = File('lib/app/router/app_router.dart').readAsStringSync();

      expect(source, contains('path: AppRoutePaths.profileSettings'));
      expect(source, contains('? const PersistedSettingsRouteScreen()'));
      expect(source, contains(': const SettingsScreen()'));
    });

    test('no privileged client boundary is introduced', () {
      final files = [
        'lib/app/router/app_router.dart',
        'lib/features/profile/presentation/screens/settings_screen.dart',
        'lib/features/profile/presentation/screens/persisted_profile_route_screens.dart',
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
