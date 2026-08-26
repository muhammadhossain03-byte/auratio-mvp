import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/foundation/presentation/foundation_page.dart';
import 'app_route_paths.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: [
      GoRoute(
        path: AppRoutePaths.foundation,
        builder: (context, state) => const FoundationPage(),
      ),
    ],
  );
});
