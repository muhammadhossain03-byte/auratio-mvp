import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/sign_in_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Sign In',
      path: AppRoutePaths.signIn,
      identifyingCopy: 'Welcome back',
      ctaLabel: 'Sign In',
    ),
    _BatchScreenCase(
      name: 'Create Account',
      path: AppRoutePaths.createAccount,
      identifyingCopy: 'Create your account',
      ctaLabel: 'Create Account',
    ),
    _BatchScreenCase(
      name: 'Verify Email',
      path: AppRoutePaths.verifyEmail,
      identifyingCopy: 'Check your inbox',
      ctaLabel: 'Back to Sign In',
    ),
    _BatchScreenCase(
      name: 'Email Verified',
      path: AppRoutePaths.emailVerified,
      identifyingCopy: 'Email verified',
      ctaLabel: 'Continue to Sign In',
    ),
    _BatchScreenCase(
      name: 'Onboarding Intro',
      path: AppRoutePaths.onboardingIntro,
      identifyingCopy: 'Build communication skill through practice.',
      ctaLabel: 'Get Started',
    ),
    _BatchScreenCase(
      name: 'Choose Paths',
      path: AppRoutePaths.choosePaths,
      identifyingCopy: 'Select one or more areas to focus on.',
      ctaLabel: 'Continue',
    ),
    _BatchScreenCase(
      name: 'Sign In New Account',
      path: AppRoutePaths.signInNewAccount,
      identifyingCopy: 'Welcome back',
      ctaLabel: 'Sign In',
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      // Keep the authoritative Verify Email timeout pending, and use the same
      // bounded pump for image-bearing screens so tests do not wait on assets.
      await tester.pump(const Duration(milliseconds: 100));

      expect(router.state.uri.path, screen.path);
      expect(find.text(screen.identifyingCopy), findsOneWidget);
      expectInsideTestCanvas(tester, find.byType(Scaffold));
      expectInsideTestCanvas(
        tester,
        find.widgetWithText(AuratioButton, screen.ctaLabel),
      );
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('the two Sign In routes reuse one screen with distinct flows', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);

    await openAuratioRoute(tester, router, AppRoutePaths.signIn, settle: false);
    await tester.pump(const Duration(milliseconds: 100));
    expect(router.state.uri.path, AppRoutePaths.signIn);
    expect(
      tester.widget<SignInScreen>(find.byType(SignInScreen)).flow,
      SignInFlow.returning,
    );

    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.signInNewAccount,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));
    expect(router.state.uri.path, AppRoutePaths.signInNewAccount);
    expect(
      tester.widget<SignInScreen>(find.byType(SignInScreen)).flow,
      SignInFlow.newAccount,
    );
    expect(tester.takeException(), isNull);
  });
}

class _BatchScreenCase {
  const _BatchScreenCase({
    required this.name,
    required this.path,
    required this.identifyingCopy,
    required this.ctaLabel,
  });

  final String name;
  final String path;
  final String identifyingCopy;
  final String ctaLabel;
}
