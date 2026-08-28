import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/forgot_password_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/reset_password_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  for (final form in const <_KeyboardSafeForm>[
    _KeyboardSafeForm(
      name: 'Forgot Password email',
      route: AppRoutePaths.forgotPassword,
      fieldKey: ForgotPasswordScreen.emailFieldKey,
    ),
    _KeyboardSafeForm(
      name: 'Reset Password confirmation',
      route: AppRoutePaths.resetPassword,
      fieldKey: ResetPasswordScreen.confirmPasswordFieldKey,
    ),
  ]) {
    testWidgets('${form.name} remains visible above the software keyboard', (
      tester,
    ) async {
      const keyboardHeight = 320.0;
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, form.route, settle: false);
      await tester.pump(const Duration(milliseconds: 100));

      final editable = find.descendant(
        of: find.byKey(form.fieldKey),
        matching: find.byType(EditableText),
      );
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
    required this.fieldKey,
  });

  final String name;
  final String route;
  final Key fieldKey;
}
