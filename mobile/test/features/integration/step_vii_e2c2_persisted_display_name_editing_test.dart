import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E2C2 persisted display-name editing', () {
    test('SettingsScreen exposes configured display-name editing', () {
      final source = File(
        'lib/features/profile/presentation/screens/settings_screen.dart',
      ).readAsStringSync();

      expect(source, contains("this.displayName = 'Alex Morgan'"));
      expect(
        source,
        contains(
          'final Future<void> Function(String displayName)? '
          'onUpdateDisplayName',
        ),
      );
      expect(source, contains('SettingsScreen.editDisplayNameKey'));
      expect(source, contains("const Text('Edit display name')"));
      expect(source, contains("child: const Text('Save')"));
    });

    test('display-name edit validates repository-compatible bounds', () {
      final source = File(
        'lib/features/profile/presentation/screens/settings_screen.dart',
      ).readAsStringSync();

      expect(
        source,
        contains('if (normalized.length < 2 || normalized.length > 80)'),
      );
      expect(source, contains('await onUpdateDisplayName(nextName)'));
      expect(source, contains("'Display name updated.'"));
      expect(source, contains("'Unable to update display name. Try again.'"));
    });

    test('unconfigured Settings does not expose edit-name affordance', () {
      final source = File(
        'lib/features/profile/presentation/screens/settings_screen.dart',
      ).readAsStringSync();

      expect(source, contains('if (widget.onUpdateDisplayName != null)'));
    });

    test(
      'persisted wrapper writes through profile repository then refreshes',
      () {
        final source = File(
          'lib/features/profile/presentation/screens/persisted_profile_route_screens.dart',
        ).readAsStringSync();

        expect(source, contains('displayName: value.displayName'));
        expect(source, contains('onUpdateDisplayName: (displayName) async'));
        expect(source, contains('.updateDisplayName(displayName)'));
        expect(
          source,
          contains('ref.invalidate(persistedEndUserProfileProvider)'),
        );
      },
    );

    test('no privileged client boundary is introduced', () {
      final files = [
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
