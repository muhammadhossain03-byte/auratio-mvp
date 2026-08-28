import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../widgets/authentication_widgets.dart';

class PasswordResetCompleteScreen extends StatelessWidget {
  const PasswordResetCompleteScreen({super.key});

  static const screenKey = Key('authentication-password-reset-complete');
  static const returnToSignInActionKey = Key(
    'password-reset-complete-return-to-sign-in',
  );

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: authenticationLightOverlayStyle,
      child: Scaffold(
        key: PasswordResetCompleteScreen.screenKey,
        backgroundColor: AuratioColors.backgroundApp,
        body: Stack(
          children: [
            const Positioned(
              left: 0,
              right: 0,
              top: 0,
              child: AuratioScreenHeader(title: 'Password Updated'),
            ),
            const Positioned(
              left: 155,
              top: 176,
              child: AuthenticationStatusIcon.success(),
            ),
            Positioned(
              left: 20,
              top: 286,
              width: 350,
              child: Text(
                'Password updated',
                textAlign: TextAlign.center,
                style: AuratioTypography.headingMedium.copyWith(
                  color: AuratioColors.textPrimary,
                ),
              ),
            ),
            Positioned(
              left: 34,
              top: 334,
              width: 322,
              child: Text(
                'Your new password is saved. Use it the next time you sign in to Auratio.',
                textAlign: TextAlign.center,
                style: AuratioTypography.bodyMedium.copyWith(
                  color: AuratioColors.textSecondary,
                  fontSize: 13,
                  height: 19 / 13,
                ),
              ),
            ),
            Positioned(
              left: 20,
              top: 712,
              width: 350,
              child: AuratioButton(
                key: PasswordResetCompleteScreen.returnToSignInActionKey,
                label: 'Return to Sign In',
                expand: true,
                onPressed: () => context.go(AppRoutePaths.signIn),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
