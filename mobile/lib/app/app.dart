import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../foundation/design_system/auratio_theme.dart';
import 'router/app_router.dart';

class AuratioApp extends ConsumerWidget {
  const AuratioApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: ref.watch(appRouterProvider),
      title: 'Auratio',
      theme: AuratioTheme.light,
    );
  }
}
