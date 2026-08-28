import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/forgot_password_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/password_reset_complete_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/reset_link_sent_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/reset_password_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Forgot Password',
      path: AppRoutePaths.forgotPassword,
      screenKey: ForgotPasswordScreen.screenKey,
      supportingCardKey: ForgotPasswordScreen.informationCardKey,
      identifyingCopy: 'Reset your password',
      ctaLabel: 'Send Reset Link',
    ),
    _BatchScreenCase(
      name: 'Reset Link Sent',
      path: AppRoutePaths.resetLinkSent,
      screenKey: ResetLinkSentScreen.screenKey,
      supportingCardKey: ResetLinkSentScreen.guidanceCardKey,
      identifyingCopy: 'Reset link sent',
      ctaLabel: 'Back to Sign In',
    ),
    _BatchScreenCase(
      name: 'Reset Password',
      path: AppRoutePaths.resetPassword,
      screenKey: ResetPasswordScreen.screenKey,
      supportingCardKey: ResetPasswordScreen.requirementCardKey,
      identifyingCopy: 'Choose a new password',
      ctaLabel: 'Update Password',
    ),
    _BatchScreenCase(
      name: 'Password Reset Complete',
      path: AppRoutePaths.passwordResetComplete,
      screenKey: PasswordResetCompleteScreen.screenKey,
      identifyingCopy: 'Password updated',
      ctaLabel: 'Return to Sign In',
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      // Keep the authoritative Reset Link Sent timeout pending while checking
      // its initial composition; image-bearing screens use the same bounded
      // pump so route tests remain deterministic.
      await tester.pump(const Duration(milliseconds: 100));

      expect(router.state.uri.path, screen.path);
      expect(find.byKey(screen.screenKey), findsOneWidget);
      expect(find.text(screen.identifyingCopy), findsOneWidget);
      expectInsideTestCanvas(tester, find.byType(Scaffold));
      if (screen.supportingCardKey case final supportingCardKey?) {
        expectInsideTestCanvas(tester, find.byKey(supportingCardKey));
      }
      expectInsideTestCanvas(
        tester,
        find.widgetWithText(AuratioButton, screen.ctaLabel),
      );
      expect(tester.takeException(), isNull);

      if (screen.path == AppRoutePaths.resetLinkSent) {
        // Cancel the simulated-link timer after its initial screen was checked.
        await tester.tap(find.byKey(ResetLinkSentScreen.backToSignInActionKey));
        await tester.pump();
      }
    });
  }

  test('all Batch 2 routes remain inside the authentication route group', () {
    expect(<String>{
      AppRoutePaths.forgotPassword,
      AppRoutePaths.resetLinkSent,
      AppRoutePaths.resetPassword,
      AppRoutePaths.passwordResetComplete,
    }, everyElement(startsWith('${AppRoutePaths.authentication}/')));
  });
}

class _BatchScreenCase {
  const _BatchScreenCase({
    required this.name,
    required this.path,
    required this.screenKey,
    required this.identifyingCopy,
    required this.ctaLabel,
    this.supportingCardKey,
  });

  final String name;
  final String path;
  final Key screenKey;
  final Key? supportingCardKey;
  final String identifyingCopy;
  final String ctaLabel;
}
