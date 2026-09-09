import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/authentication/application/auth_navigation_events.dart';
import '../foundation/design_system/auratio_theme.dart';
import 'router/app_route_paths.dart';
import 'router/app_router.dart';

class AuratioApp extends ConsumerWidget {
  const AuratioApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    ref.listen(authNavigationEventProvider, (previous, next) {
      next.whenData((event) {
        switch (event) {
          case AuratioAuthNavigationEvent.passwordRecovery:
            router.go(AppRoutePaths.resetPassword);
        }
      });
    });

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      title: 'Auratio',
      theme: AuratioTheme.light,
    );
  }
}
