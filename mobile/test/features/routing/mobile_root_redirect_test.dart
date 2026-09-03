import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets(
    'mobile cold start at root / redirects to returning-user Sign In',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.signIn);
      expect(find.text('Sign In'), findsWidgets);
      expect(find.text('name@example.com'), findsOneWidget);
      expect(find.text('New to Auratio?'), findsOneWidget);
      expect(find.text('Create account'), findsOneWidget);
    },
  );
}
