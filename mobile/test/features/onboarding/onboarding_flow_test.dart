import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/onboarding/presentation/onboarding_keys.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets('Onboarding Intro opens Choose Paths', (tester) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.onboardingIntro,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byKey(OnboardingKeys.introScreen), findsOneWidget);

    await tester.tap(find.byKey(OnboardingKeys.getStartedButton));
    await tester.pump();

    expect(router.state.uri.path, AppRoutePaths.choosePaths);
    expect(find.byKey(OnboardingKeys.choosePathsScreen), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('entire Path card toggles its accessible checked state', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.choosePaths,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    final publicSpeaking = find.byKey(
      OnboardingKeys.pathCard(AuratioPath.publicSpeaking),
    );
    final professionalPresenting = find.byKey(
      OnboardingKeys.pathCard(AuratioPath.professionalPresenting),
    );
    final contentCreation = find.byKey(
      OnboardingKeys.pathCard(AuratioPath.contentCreation),
    );

    _expectPathSemantics(
      tester,
      publicSpeaking,
      label: 'Public Speaking. Five speaking formats',
      selected: true,
    );
    _expectPathSemantics(
      tester,
      professionalPresenting,
      label: 'Professional Presenting. Five professional presentation modes',
      selected: true,
    );
    _expectPathSemantics(
      tester,
      contentCreation,
      label: 'Content Creation. Three speaker-led content niches',
      selected: false,
    );

    expect(
      tester.getSize(contentCreation).height,
      greaterThanOrEqualTo(AuratioSizing.minimumTouchTarget),
    );

    // The card center is outside the visual checkbox and must still toggle it.
    await tester.tap(contentCreation);
    await tester.pump();

    _expectPathSemantics(
      tester,
      contentCreation,
      label: 'Content Creation. Three speaker-led content niches',
      selected: true,
    );

    await tester.tap(contentCreation);
    await tester.pump();

    _expectPathSemantics(
      tester,
      contentCreation,
      label: 'Content Creation. Three speaker-led content niches',
      selected: false,
    );
    expect(tester.takeException(), isNull);
    semantics.dispose();
  });

  testWidgets('Continue disables at zero Paths and enables at exactly one', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.choosePaths,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(
      find.byKey(OnboardingKeys.pathCard(AuratioPath.publicSpeaking)),
    );
    await tester.pump();
    await tester.tap(
      find.byKey(OnboardingKeys.pathCard(AuratioPath.professionalPresenting)),
    );
    await tester.pump();

    TextButton continueButton() => tester.widget<TextButton>(
      find.descendant(
        of: find.byKey(OnboardingKeys.continueButton),
        matching: find.byType(TextButton),
      ),
    );

    expect(continueButton().onPressed, isNull);
    expect(
      continueButton().style?.backgroundColor?.resolve({WidgetState.disabled}),
      AuratioColors.actionDisabledBackground,
    );

    await tester.tap(
      find.byKey(OnboardingKeys.continueButton),
      warnIfMissed: false,
    );
    await tester.pump();
    expect(router.state.uri.path, AppRoutePaths.choosePaths);

    await tester.tap(
      find.byKey(OnboardingKeys.pathCard(AuratioPath.contentCreation)),
    );
    await tester.pump();

    expect(continueButton().onPressed, isNotNull);
    expect(tester.takeException(), isNull);
  });
}

void _expectPathSemantics(
  WidgetTester tester,
  Finder finder, {
  required String label,
  required bool selected,
}) {
  expect(
    tester.getSemantics(finder),
    isSemantics(
      label: label,
      value: selected ? 'Selected' : 'Not selected',
      hasCheckedState: true,
      isChecked: selected,
      hasTapAction: true,
    ),
  );
}
