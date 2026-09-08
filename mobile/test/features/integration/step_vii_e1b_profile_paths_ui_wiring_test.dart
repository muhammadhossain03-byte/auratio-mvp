import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E1B configured profile/Path UI wiring', () {
    test('router switches configured profile routes to persisted wrappers', () {
      final source = File('lib/app/router/app_router.dart').readAsStringSync();

      expect(source, contains('profileConfigured'));
      expect(source, contains('PersistedProfileRouteScreen'));
      expect(source, contains('PersistedChoosePathsRouteScreen'));
      expect(source, contains('PersistedManagePathsRouteScreen'));
    });

    test('profile accepts persisted identity and Path state', () {
      final source = File(
        'lib/features/profile/presentation/screens/profile_screen.dart',
      ).readAsStringSync();

      expect(source, contains("this.displayName = 'Alex Morgan'"));
      expect(source, contains("this.email = 'alex@example.com'"));
      expect(source, contains('final Set<AuratioPath>? persistedPaths'));
      expect(source, contains('final Set<AuratioPath> savedPaths'));
      expect(
        source,
        contains('ref.watch<Set<AuratioPath>>(selectedPathsProvider)'),
      );
    });

    test('configured onboarding and Manage Paths persist before navigation', () {
      final choose = File(
        'lib/features/onboarding/presentation/screens/choose_paths_screen.dart',
      ).readAsStringSync();
      final manage = File(
        'lib/features/profile/presentation/screens/manage_paths_screen.dart',
      ).readAsStringSync();

      expect(choose, contains('onPersistedContinue'));
      expect(choose, contains('await persistedContinue'));
      expect(manage, contains('onPersistedSave'));
      expect(manage, contains('await persistedSave'));
      expect(manage, contains('widget.initialPaths ??'));
      expect(
        manage,
        contains('ref.read<Set<AuratioPath>>(selectedPathsProvider)'),
      );
      expect(
        choose,
        contains('ref.watch<Set<AuratioPath>>(selectedPathsProvider)'),
      );
    });

    test(
      'configured route wrapper invalidates persisted state after saves',
      () {
        final source = File(
          'lib/features/profile/presentation/screens/persisted_profile_route_screens.dart',
        ).readAsStringSync();

        expect(source, contains('.replacePaths(selection)'));
        expect(source, contains('persistedSelectedPathsProvider'));
        expect(source, contains('persistedEndUserProfileProvider'));
        expect(source, contains('ref.invalidate'));
      },
    );
  });
}
