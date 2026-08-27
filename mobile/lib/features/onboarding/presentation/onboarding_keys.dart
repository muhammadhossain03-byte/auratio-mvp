import 'package:flutter/widgets.dart';

import '../domain/auratio_path.dart';

abstract final class OnboardingKeys {
  static const introScreen = Key('onboarding-intro-screen');
  static const getStartedButton = Key('onboarding-get-started-button');
  static const choosePathsScreen = Key('onboarding-choose-paths-screen');
  static const continueButton = Key('onboarding-continue-button');

  static Key pathCard(AuratioPath path) =>
      ValueKey<String>('onboarding-path-card-${path.name}');
}
