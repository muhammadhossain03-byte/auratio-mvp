import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  for (final form in const <_KeyboardSafeForm>[
    _KeyboardSafeForm(
      name: 'Sign In password',
      route: AppRoutePaths.signIn,
      fieldIndex: 1,
    ),
    _KeyboardSafeForm(
      name: 'Create Account password confirmation',
      route: AppRoutePaths.createAccount,
      fieldIndex: 3,
    ),
  ]) {
    testWidgets('${form.name} remains visible above the software keyboard', (
      tester,
    ) async {
      const keyboardHeight = 320.0;
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, form.route, settle: false);
      await tester.pump(const Duration(milliseconds: 100));

      final editable = find.byType(EditableText).at(form.fieldIndex);
      expect(editable, findsOneWidget);

      await tester.showKeyboard(editable);
      tester.view.viewInsets = const FakeViewPadding(bottom: keyboardHeight);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(
        tester.getBottomRight(editable).dy,
        lessThanOrEqualTo(auratioTestCanvas.height - keyboardHeight),
      );
      expect(tester.takeException(), isNull);

      FocusManager.instance.primaryFocus?.unfocus();
      tester.testTextInput.hide();
      tester.view.resetViewInsets();
      await tester.pump();
    });
  }
}

class _KeyboardSafeForm {
  const _KeyboardSafeForm({
    required this.name,
    required this.route,
    required this.fieldIndex,
  });

  final String name;
  final String route;
  final int fieldIndex;
}
