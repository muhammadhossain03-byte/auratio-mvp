import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E2F2 Flutter web auth URL strategy', () {
    test('Flutter web plugins is an explicit SDK dependency', () {
      final source = File('pubspec.yaml').readAsStringSync();

      expect(source, contains('flutter_web_plugins:'));
      expect(source, contains('flutter_web_plugins:\n    sdk: flutter'));
    });

    test(
      'startup enables path URL strategy before Supabase initialization',
      () {
        final source = File('lib/main.dart').readAsStringSync();

        expect(
          source,
          contains("import 'package:flutter_web_plugins/url_strategy.dart';"),
        );
        expect(source, contains('usePathUrlStrategy();'));
        expect(
          source,
          contains('await AuratioSupabase.initializeFromEnvironment();'),
        );

        final pathStrategy = source.indexOf('usePathUrlStrategy();');
        final supabaseInit = source.indexOf(
          'await AuratioSupabase.initializeFromEnvironment();',
        );

        expect(pathStrategy, greaterThanOrEqualTo(0));
        expect(supabaseInit, greaterThan(pathStrategy));
      },
    );

    test('Flutter web platform scaffold supports release builds', () {
      final index = File('web/index.html').readAsStringSync();
      final manifest = File('web/manifest.json').readAsStringSync();

      expect(index, contains(r'<base href="$FLUTTER_BASE_HREF">'));
      expect(index, contains('flutter_bootstrap.js'));
      expect(index, contains('manifest.json'));
      expect(manifest, contains('"name": "Auratio"'));
      expect(manifest, contains('"start_url": "."'));
    });

    test('web password recovery remains a real path route', () {
      final source = File(
        'lib/features/authentication/application/auth_redirects.dart',
      ).readAsStringSync();

      expect(source, contains('if (kIsWeb)'));
      expect(
        source,
        contains('Uri.base.resolve(AppRoutePaths.resetPassword).toString()'),
      );
    });

    test('no privileged boundary is introduced', () {
      final source = [
        'lib/main.dart',
        'lib/features/authentication/application/auth_redirects.dart',
      ].map((path) => File(path).readAsStringSync()).join('\n');

      expect(source, isNot(contains('SUPABASE_SERVICE_ROLE_KEY')));
      expect(source, isNot(contains('service_role')));
      expect(source, isNot(contains('svc_')));
    });
  });
}
