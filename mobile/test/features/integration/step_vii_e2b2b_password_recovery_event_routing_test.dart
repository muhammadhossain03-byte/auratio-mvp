import 'dart:async';
import 'dart:io';

import 'package:auratio_mobile/app/app.dart';
import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/application/auth_navigation_events.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/reset_password_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

void main() {
  group('Step VII-E2B2B password-recovery event routing', () {
    test('provider filters the exact Supabase passwordRecovery event', () {
      final source = File(
        'lib/features/authentication/application/auth_navigation_events.dart',
      ).readAsStringSync();

      expect(source, contains('client.auth.onAuthStateChange'));
      expect(
        source,
        contains('state.event == AuthChangeEvent.passwordRecovery'),
      );
      expect(source, contains('AuratioAuthNavigationEvent.passwordRecovery'));
    });

    testWidgets('passwordRecovery event opens Reset Password', (tester) async {
      final events = StreamController<AuratioAuthNavigationEvent>();
      addTearDown(events.close);

      tester.view
        ..devicePixelRatio = 1
        ..physicalSize = const Size(390, 844);
      addTearDown(tester.view.reset);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authNavigationEventProvider.overrideWith((ref) => events.stream),
          ],
          child: const AuratioApp(),
        ),
      );
      await tester.pump();

      final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
      final router = app.routerConfig! as GoRouter;

      router.go(AppRoutePaths.signIn);
      await tester.pump();
      expect(router.state.uri.path, AppRoutePaths.signIn);

      events.add(AuratioAuthNavigationEvent.passwordRecovery);
      await tester.pump();
      await tester.pump();

      expect(router.state.uri.path, AppRoutePaths.resetPassword);
      expect(find.byKey(ResetPasswordScreen.screenKey), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    test(
      'application listener routes only semantic auth navigation events',
      () {
        final source = File('lib/app/app.dart').readAsStringSync();

        expect(source, contains('ref.listen(authNavigationEventProvider'));
        expect(
          source,
          contains('case AuratioAuthNavigationEvent.passwordRecovery:'),
        );
        expect(source, contains('router.go(AppRoutePaths.resetPassword)'));
      },
    );

    test('no privileged client boundary is introduced', () {
      final source = [
        'lib/features/authentication/application/auth_navigation_events.dart',
        'lib/app/app.dart',
      ].map((path) => File(path).readAsStringSync()).join('\n');

      expect(source, isNot(contains('SUPABASE_SERVICE_ROLE_KEY')));
      expect(source, isNot(contains('service_role')));
      expect(source, isNot(contains('svc_')));
    });
  });
}
