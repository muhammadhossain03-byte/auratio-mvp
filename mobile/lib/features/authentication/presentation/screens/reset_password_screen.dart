import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../widgets/authentication_widgets.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  static const screenKey = Key('authentication-reset-password');
  static const newPasswordFieldKey = Key('reset-password-new-password-field');
  static const confirmPasswordFieldKey = Key(
    'reset-password-confirm-password-field',
  );
  static const requirementCardKey = Key('reset-password-requirement-card');
  static const submitActionKey = Key('reset-password-submit');

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _reserveNewPasswordErrorSpace = false;
  bool _reserveConfirmationErrorSpace = false;

  @override
  void dispose() {
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _requiredValue(String? value) {
    if (value == null || value.isEmpty) {
      return 'This field is required.';
    }
    return null;
  }

  String? _validateNewPassword(String? value) {
    final requiredError = _requiredValue(value);
    if (requiredError != null) {
      return requiredError;
    }
    if (value!.length < 8) {
      return 'Use at least 8 characters.';
    }
    return null;
  }

  String? _validateConfirmation(String? value) {
    final requiredError = _requiredValue(value);
    if (requiredError != null) {
      return requiredError;
    }
    if (value != _newPasswordController.text) {
      return 'Passwords must match.';
    }
    return null;
  }

  void _updatePassword() {
    final needsNewPasswordErrorSpace =
        _validateNewPassword(_newPasswordController.text) != null;
    final needsConfirmationErrorSpace =
        _validateConfirmation(_confirmPasswordController.text) != null;
    final isValid = _formKey.currentState?.validate() ?? false;

    if (_reserveNewPasswordErrorSpace != needsNewPasswordErrorSpace ||
        _reserveConfirmationErrorSpace != needsConfirmationErrorSpace) {
      setState(() {
        _reserveNewPasswordErrorSpace = needsNewPasswordErrorSpace;
        _reserveConfirmationErrorSpace = needsConfirmationErrorSpace;
      });
    }

    if (!isValid) {
      return;
    }

    context.go(AppRoutePaths.passwordResetComplete);
  }

  void _goBack() {
    if (context.canPop()) {
      context.pop();
      return;
    }
    context.go(AppRoutePaths.resetLinkSent);
  }

  @override
  Widget build(BuildContext context) {
    final confirmationOffset = _reserveNewPasswordErrorSpace ? 20.0 : 0.0;
    final cardOffset =
        confirmationOffset + (_reserveConfirmationErrorSpace ? 20.0 : 0.0);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: authenticationLightOverlayStyle,
      child: Scaffold(
        key: ResetPasswordScreen.screenKey,
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
                    title: 'Reset Password',
                    showBack: true,
                    onBack: _goBack,
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 126,
                  width: 350,
                  child: Text(
                    'Choose a new password',
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
                    'Set a new password for your Auratio account.',
                    style: AuratioTypography.bodyMedium.copyWith(
                      color: AuratioColors.textSecondary,
                      fontSize: 13,
                      height: 19 / 13,
                    ),
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 232,
                  width: 350,
                  child: AuratioInput(
                    key: ResetPasswordScreen.newPasswordFieldKey,
                    label: 'NEW PASSWORD',
                    controller: _newPasswordController,
                    placeholder: 'At least 8 characters',
                    obscureText: true,
                    textInputAction: TextInputAction.next,
                    validator: _validateNewPassword,
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
                  top: 336 + confirmationOffset,
                  width: 350,
                  child: AuratioInput(
                    key: ResetPasswordScreen.confirmPasswordFieldKey,
                    label: 'CONFIRM NEW PASSWORD',
                    controller: _confirmPasswordController,
                    placeholder: 'Repeat your new password',
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    validator: _validateConfirmation,
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
                  top: 452 + cardOffset,
                  width: 350,
                  height: 84,
                  child: const _PasswordRequirementCard(
                    key: ResetPasswordScreen.requirementCardKey,
                  ),
                ),
                Positioned(
                  left: 20,
                  top: 712,
                  width: 350,
                  child: AuratioButton(
                    key: ResetPasswordScreen.submitActionKey,
                    label: 'Update Password',
                    expand: true,
                    onPressed: _updatePassword,
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

class _PasswordRequirementCard extends StatelessWidget {
  const _PasswordRequirementCard({super.key});

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
              'Password requirement',
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
              'Use at least 8 characters. Both entries must match.',
              maxLines: 1,
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
