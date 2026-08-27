import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/application/mock_registration_state.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/create_account_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/email_verified_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/sign_in_screen.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/verify_email_screen.dart';
import 'package:auratio_mobile/features/onboarding/presentation/onboarding_keys.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets('invalid Create Account feedback preserves readable layout', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.createAccount,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(find.byKey(CreateAccountScreen.submitActionKey));
    await tester.pump();

    final confirmationBottom = tester
        .getRect(find.byKey(CreateAccountScreen.confirmPasswordFieldKey))
        .bottom;
    final helperTop = tester
        .getRect(
          find.text(
            'We’ll send a verification email before the account can be used.',
          ),
        )
        .top;

    expect(router.state.uri.path, AppRoutePaths.createAccount);
    expect(helperTop, greaterThanOrEqualTo(confirmationBottom));
    expectInsideTestCanvas(
      tester,
      find.byKey(CreateAccountScreen.pathsCardKey),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('Create Account captures mock state and opens Verify Email', (
    tester,
  ) async {
    const fullName = 'Alex Morgan';
    const email = 'alex.morgan@example.com';
    const password = 'prototype-password';

    final router = await pumpAuratioApp(tester);
    final container = ProviderScope.containerOf(
      tester.element(find.byType(MaterialApp)),
    );
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.createAccount,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.enterText(
      _formField(CreateAccountScreen.fullNameFieldKey),
      '  $fullName  ',
    );
    await tester.enterText(
      _formField(CreateAccountScreen.emailFieldKey),
      '  $email  ',
    );
    await tester.enterText(
      _formField(CreateAccountScreen.passwordFieldKey),
      password,
    );
    await tester.enterText(
      _formField(CreateAccountScreen.confirmPasswordFieldKey),
      password,
    );
    FocusManager.instance.primaryFocus?.unfocus();
    tester.testTextInput.hide();
    await tester.pump();

    await tester.tap(find.byKey(CreateAccountScreen.submitActionKey));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.verifyEmail);
    expect(find.byKey(VerifyEmailScreen.screenKey), findsOneWidget);
    expect(find.text('We sent a verification link to $email.'), findsOneWidget);
    expect(
      container.read(mockRegistrationProvider),
      isA<MockRegistrationState>()
          .having((state) => state.fullName, 'fullName', fullName)
          .having((state) => state.email, 'email', email)
          .having((state) => state.password, 'password', password),
    );

    // Complete the inspected Figma timeout so no verification timer remains
    // pending after this test.
    await tester.pump(VerifyEmailScreen.transitionDelay);
    await tester.pump();
    expect(router.state.uri.path, AppRoutePaths.emailVerified);
    expect(find.byKey(EmailVerifiedScreen.screenKey), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Email Verified continues to the new-account Sign In state', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.emailVerified,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(find.byKey(EmailVerifiedScreen.continueActionKey));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.signInNewAccount);
    expect(find.byKey(SignInScreen.newAccountScreenKey), findsOneWidget);
    expect(find.byKey(SignInScreen.returningScreenKey), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('resending verification is local and stays on Verify Email', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    final container = ProviderScope.containerOf(
      tester.element(find.byType(MaterialApp)),
    );
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.verifyEmail,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(find.byKey(VerifyEmailScreen.resendActionKey));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.verifyEmail);
    expect(container.read(mockRegistrationProvider).resendCount, 1);

    // Leave the screen to cancel its authoritative automatic-transition timer.
    await tester.tap(find.byKey(VerifyEmailScreen.backToSignInActionKey));
    await tester.pump();
    expect(router.state.uri.path, AppRoutePaths.signIn);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'new-account Sign In enters onboarding while returning Sign In stays',
    (tester) async {
      final router = await pumpAuratioApp(tester);

      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.signIn,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));
      await tester.tap(find.byKey(SignInScreen.signInActionKey));
      await tester.pump();
      expect(router.state.uri.path, AppRoutePaths.signIn);

      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.signInNewAccount,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));
      await tester.tap(find.byKey(SignInScreen.signInActionKey));
      await tester.pump();

      expect(router.state.uri.path, AppRoutePaths.onboardingIntro);
      expect(find.byKey(OnboardingKeys.introScreen), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}

Finder _formField(Key key) {
  return find.descendant(
    of: find.byKey(key),
    matching: find.byType(TextFormField),
  );
}
