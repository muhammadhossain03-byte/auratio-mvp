import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/application/mock_password_recovery_state.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/forgot_password_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/password_reset_complete_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/reset_link_sent_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/reset_password_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/sign_in_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets('Sign In Forgot Password action opens password recovery', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.signIn, settle: false);
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(find.byKey(SignInScreen.forgotPasswordActionKey));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.forgotPassword);
    expect(find.byKey(ForgotPasswordScreen.screenKey), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Forgot Password captures a trimmed email and opens Link Sent', (
    tester,
  ) async {
    const email = 'alex.morgan@example.com';
    final router = await pumpAuratioApp(tester);
    final container = ProviderScope.containerOf(
      tester.element(find.byType(MaterialApp)),
    );
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.forgotPassword,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.enterText(
      _formField(ForgotPasswordScreen.emailFieldKey),
      '  $email  ',
    );
    FocusManager.instance.primaryFocus?.unfocus();
    tester.testTextInput.hide();
    await tester.pump();

    await tester.tap(find.byKey(ForgotPasswordScreen.sendResetLinkActionKey));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.resetLinkSent);
    expect(find.byKey(ResetLinkSentScreen.screenKey), findsOneWidget);
    expect(container.read(mockPasswordRecoveryProvider).email, email);
    expect(
      find.text(
        'If an Auratio account exists for $email, a password-reset email has been sent.',
      ),
      findsOneWidget,
    );

    // Leave the timed screen so its simulated-link timer is cancelled.
    await tester.tap(find.byKey(ResetLinkSentScreen.backToSignInActionKey));
    await tester.pump();
    expect(router.state.uri.path, AppRoutePaths.signIn);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Reset Link Sent resend stays local and back returns to Sign In',
    (tester) async {
      const email = 'speaker@example.com';
      final router = await pumpAuratioApp(tester);
      final container = ProviderScope.containerOf(
        tester.element(find.byType(MaterialApp)),
      );
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.forgotPassword,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));
      await tester.enterText(
        _formField(ForgotPasswordScreen.emailFieldKey),
        email,
      );
      FocusManager.instance.primaryFocus?.unfocus();
      tester.testTextInput.hide();
      await tester.pump();
      await tester.tap(find.byKey(ForgotPasswordScreen.sendResetLinkActionKey));
      await tester.pump();

      await tester.tap(find.byKey(ResetLinkSentScreen.resendActionKey));
      await tester.pump();

      expect(router.state.uri.path, AppRoutePaths.resetLinkSent);
      expect(container.read(mockPasswordRecoveryProvider).resendCount, 1);
      expect(find.byKey(ResetLinkSentScreen.screenKey), findsOneWidget);

      await tester.tap(find.byKey(ResetLinkSentScreen.backToSignInActionKey));
      await tester.pump();

      expect(router.state.uri.path, AppRoutePaths.signIn);
      expect(find.byKey(SignInScreen.returningScreenKey), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('simulated emailed link opens Reset Password after 1800ms', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.resetLinkSent,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(router.state.uri.path, AppRoutePaths.resetLinkSent);
    expect(find.byKey(ResetPasswordScreen.screenKey), findsNothing);

    // The Figma binding stays on this screen until the 1800 ms boundary.
    await tester.pump(const Duration(milliseconds: 1699));
    expect(router.state.uri.path, AppRoutePaths.resetLinkSent);
    expect(find.byKey(ResetPasswordScreen.screenKey), findsNothing);

    await tester.pump(const Duration(milliseconds: 1));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.resetPassword);
    expect(find.byKey(ResetPasswordScreen.screenKey), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Reset Password rejects passwords shorter than eight characters',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.resetPassword,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));

      await tester.enterText(
        _formField(ResetPasswordScreen.newPasswordFieldKey),
        'short',
      );
      await tester.enterText(
        _formField(ResetPasswordScreen.confirmPasswordFieldKey),
        'short',
      );
      await _dismissKeyboard(tester);
      await tester.tap(find.byKey(ResetPasswordScreen.submitActionKey));
      await tester.pump();

      expect(router.state.uri.path, AppRoutePaths.resetPassword);
      expect(find.text('Use at least 8 characters.'), findsOneWidget);
      final confirmationBottom = tester
          .getRect(find.byKey(ResetPasswordScreen.confirmPasswordFieldKey))
          .bottom;
      final requirementTop = tester
          .getRect(find.byKey(ResetPasswordScreen.requirementCardKey))
          .top;
      expect(requirementTop, greaterThanOrEqualTo(confirmationBottom));
      expectInsideTestCanvas(
        tester,
        find.byKey(ResetPasswordScreen.requirementCardKey),
      );
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('Reset Password rejects a mismatched confirmation', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.resetPassword,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.enterText(
      _formField(ResetPasswordScreen.newPasswordFieldKey),
      'new-password',
    );
    await tester.enterText(
      _formField(ResetPasswordScreen.confirmPasswordFieldKey),
      'different-password',
    );
    await _dismissKeyboard(tester);
    await tester.tap(find.byKey(ResetPasswordScreen.submitActionKey));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.resetPassword);
    expect(find.text('Passwords must match.'), findsOneWidget);
    final confirmationBottom = tester
        .getRect(find.byKey(ResetPasswordScreen.confirmPasswordFieldKey))
        .bottom;
    final requirementTop = tester
        .getRect(find.byKey(ResetPasswordScreen.requirementCardKey))
        .top;
    expect(requirementTop, greaterThanOrEqualTo(confirmationBottom));
    expectInsideTestCanvas(
      tester,
      find.byKey(ResetPasswordScreen.requirementCardKey),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('valid matching passwords open Password Reset Complete', (
    tester,
  ) async {
    const password = 'new-password';
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.resetPassword,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.enterText(
      _formField(ResetPasswordScreen.newPasswordFieldKey),
      password,
    );
    await tester.enterText(
      _formField(ResetPasswordScreen.confirmPasswordFieldKey),
      password,
    );
    await _dismissKeyboard(tester);
    await tester.tap(find.byKey(ResetPasswordScreen.submitActionKey));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.passwordResetComplete);
    expect(find.byKey(PasswordResetCompleteScreen.screenKey), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Password Reset Complete returns to returning-user Sign In', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.passwordResetComplete,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(
      find.byKey(PasswordResetCompleteScreen.returnToSignInActionKey),
    );
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.signIn);
    expect(find.byKey(SignInScreen.returningScreenKey), findsOneWidget);
    expect(find.byKey(SignInScreen.newAccountScreenKey), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Forgot Password back affordance is accessible and returns', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.signIn, settle: false);
    await tester.pump(const Duration(milliseconds: 100));
    await tester.tap(find.byKey(SignInScreen.forgotPasswordActionKey));
    await tester.pump();

    final back = find.bySemanticsLabel('Back');
    expect(back, findsOneWidget);
    final backSize = tester.getSize(back);
    expect(
      backSize.width,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );
    expect(
      backSize.height,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );

    await tester.tap(back);
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.signIn);
    expect(tester.takeException(), isNull);
    semantics.dispose();
  });

  testWidgets('Reset Password back uses the existing navigation stack', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.resetLinkSent,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));
    await tester.pump(ResetLinkSentScreen.transitionDelay);
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.resetPassword);
    final back = find.bySemanticsLabel('Back');
    expect(back, findsOneWidget);
    final backSize = tester.getSize(back);
    expect(
      backSize.width,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );
    expect(
      backSize.height,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );

    await tester.tap(back);
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.resetLinkSent);
    expect(find.byKey(ResetLinkSentScreen.screenKey), findsOneWidget);
    expect(tester.takeException(), isNull);
    semantics.dispose();
  });
}

Finder _formField(Key key) {
  return find.descendant(
    of: find.byKey(key),
    matching: find.byType(TextFormField),
  );
}

Future<void> _dismissKeyboard(WidgetTester tester) async {
  FocusManager.instance.primaryFocus?.unfocus();
  tester.testTextInput.hide();
  await tester.pump();
}
