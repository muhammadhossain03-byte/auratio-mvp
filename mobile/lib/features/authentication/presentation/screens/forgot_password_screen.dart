import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/mock_password_recovery_state.dart';
import '../widgets/authentication_widgets.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  static const screenKey = Key('authentication-forgot-password');
  static const emailFieldKey = Key('forgot-password-email-field');
  static const informationCardKey = Key('forgot-password-information-card');
  static const sendResetLinkActionKey = Key('forgot-password-send-reset-link');
  static const backToSignInActionKey = Key('forgot-password-back-to-sign-in');

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _reserveEmailErrorSpace = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Enter your email address.';
    }

    final email = value.trim();
    if (!email.contains('@') ||
        !email.substring(email.indexOf('@') + 1).contains('.')) {
      return 'Enter a valid email address.';
    }
    return null;
  }

  void _sendResetLink() {
    final needsErrorSpace = _validateEmail(_emailController.text) != null;
    final isValid = _formKey.currentState?.validate() ?? false;

    if (_reserveEmailErrorSpace != needsErrorSpace) {
      setState(() {
        _reserveEmailErrorSpace = needsErrorSpace;
      });
    }

    if (!isValid) {
      return;
    }

    ref
        .read(mockPasswordRecoveryProvider.notifier)
        .captureEmail(_emailController.text);
    context.go(AppRoutePaths.resetLinkSent);
  }

  @override
  Widget build(BuildContext context) {
    final cardOffset = _reserveEmailErrorSpace ? 20.0 : 0.0;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: authenticationLightOverlayStyle,
      child: Scaffold(
        key: ForgotPasswordScreen.screenKey,
        backgroundColor: AuratioColors.backgroundApp,
        resizeToAvoidBottomInset: true,
        body: AuthenticationSafeCanvas(
          child: Form(
            key: _formKey,
            child: Stack(
              children: [
                Positioned(
                  left: 0,
                  right: 0,
                  top: 0,
                  child: AuratioScreenHeader(
                    title: 'Forgot Password',
                    showBack: true,
                    onBack: () => context.go(AppRoutePaths.signIn),
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 126,
                  width: 350,
                  child: Text(
                    'Reset your password',
                    style: AuratioTypography.headingMedium.copyWith(
                      color: AuratioColors.textPrimary,
                    ),
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 170,
                  width: 350,
                  child: Text(
                    'Enter the email address for your Auratio account. We’ll send a password-reset link.',
                    style: AuratioTypography.bodyMedium.copyWith(
                      color: AuratioColors.textSecondary,
                      fontSize: 13,
                      height: 19 / 13,
                    ),
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 262,
                  width: 350,
                  child: AuratioInput(
                    key: ForgotPasswordScreen.emailFieldKey,
                    label: 'EMAIL ADDRESS',
                    controller: _emailController,
                    placeholder: 'alex@example.com',
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.done,
                    validator: _validateEmail,
                    scrollPadding: const EdgeInsets.only(bottom: 32),
                    controlHeight: 52,
                    labelGap: 8,
                    contentPadding: const EdgeInsets.fromLTRB(11, 15, 11, 17),
                    inputStyle: AuratioTypography.bodyMedium.copyWith(
                      fontSize: 13,
                      height: 18 / 13,
                      letterSpacing: -0.1,
                    ),
                    placeholderStyle: AuratioTypography.bodyMedium.copyWith(
                      color: AuratioColors.textTertiary,
                      fontSize: 13,
                      height: 18 / 13,
                      letterSpacing: -0.1,
                    ),
                    labelStyle: AuratioTypography.labelMedium.copyWith(
                      color: AuratioColors.textPrimary,
                      fontSize: 11,
                      height: 16 / 11,
                    ),
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 368 + cardOffset,
                  width: 350,
                  height: 92,
                  child: const _RecoveryInformationCard(
                    key: ForgotPasswordScreen.informationCardKey,
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 650,
                  width: 350,
                  child: AuratioButton(
                    key: ForgotPasswordScreen.sendResetLinkActionKey,
                    label: 'Send Reset Link',
                    expand: true,
                    onPressed: _sendResetLink,
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 712,
                  width: 350,
                  child: AuratioButton(
                    key: ForgotPasswordScreen.backToSignInActionKey,
                    label: 'Back to Sign In',
                    variant: AuratioButtonVariant.secondary,
                    expand: true,
                    onPressed: () => context.go(AppRoutePaths.signIn),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RecoveryInformationCard extends StatelessWidget {
  const _RecoveryInformationCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AuratioCard(
      tone: AuratioCardTone.brandSoft,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          Positioned(
            left: 14,
            top: 16,
            right: 14,
            child: Text(
              'Email-based recovery',
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.backgroundBrand,
                fontSize: 13,
                height: 18 / 13,
              ),
            ),
          ),
          Positioned(
            left: 14,
            top: 44,
            right: 14,
            child: Text(
              'Password recovery is available for MVP email/password accounts.',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AuratioTypography.bodySmall.copyWith(
                color: AuratioColors.textSecondary,
                fontSize: 12,
                height: 18 / 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
