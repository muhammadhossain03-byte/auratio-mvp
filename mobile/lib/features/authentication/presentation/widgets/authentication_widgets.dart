import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../foundation/design_system/auratio_design_system.dart';

const authenticationLightOverlayStyle = SystemUiOverlayStyle(
  statusBarColor: Colors.transparent,
  statusBarIconBrightness: Brightness.light,
  statusBarBrightness: Brightness.dark,
  systemNavigationBarColor: AuratioColors.backgroundApp,
  systemNavigationBarIconBrightness: Brightness.dark,
  systemNavigationBarDividerColor: AuratioColors.backgroundApp,
);

const authenticationSignInOverlayStyle = SystemUiOverlayStyle(
  statusBarColor: Colors.transparent,
  statusBarIconBrightness: Brightness.light,
  statusBarBrightness: Brightness.dark,
  systemNavigationBarColor: AuratioColors.surfaceDefault,
  systemNavigationBarIconBrightness: Brightness.dark,
  systemNavigationBarDividerColor: AuratioColors.surfaceDefault,
);

enum AuthenticationStatusIconType { email, success }

class AuthenticationStatusIcon extends StatelessWidget {
  const AuthenticationStatusIcon.email({super.key})
    : type = AuthenticationStatusIconType.email;

  const AuthenticationStatusIcon.success({super.key})
    : type = AuthenticationStatusIconType.success;

  final AuthenticationStatusIconType type;

  @override
  Widget build(BuildContext context) {
    final (symbol, backgroundColor, foregroundColor) = switch (type) {
      AuthenticationStatusIconType.email => (
        '@',
        AuratioColors.surfaceBrandSoft,
        AuratioColors.backgroundBrand,
      ),
      AuthenticationStatusIconType.success => (
        '✓',
        AuratioColors.green50,
        AuratioColors.green700,
      ),
    };

    return DecoratedBox(
      decoration: BoxDecoration(color: backgroundColor, shape: BoxShape.circle),
      child: SizedBox.square(
        dimension: 80,
        child: Center(
          child: Text(
            symbol,
            style: AuratioTypography.headingMedium.copyWith(
              color: foregroundColor,
              fontSize: 28,
              height: 36 / 28,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

/// Keeps the locked 390 x 844 idle composition while letting focused fields
/// scroll above the software keyboard. The first 24 px of the Figma canvas are
/// reserved for the real system status bar rather than reproduced in Flutter.
class AuthenticationSafeCanvas extends StatelessWidget {
  const AuthenticationSafeCanvas({required this.child, super.key});

  static const _figmaStatusBarHeight = 24.0;

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final topInset = mediaQuery.padding.top;
    final designLift = math.min(topInset, _figmaStatusBarHeight);

    return SafeArea(
      bottom: false,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final obscuredHeight = math.max(
            0.0,
            mediaQuery.size.height - designLift - constraints.maxHeight,
          );
          final keyboardLift = math.min(
            obscuredHeight,
            AuratioSizing.minimumTouchTarget,
          );
          final canvasHeight = math.max(
            AuratioSizing.mobileCanvasHeight,
            constraints.maxHeight + topInset + mediaQuery.viewInsets.bottom,
          );

          return SingleChildScrollView(
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            child: SizedBox(
              width: constraints.maxWidth,
              height: canvasHeight - designLift,
              child: Transform.translate(
                offset: Offset(0, -designLift - keyboardLift),
                child: SizedBox(
                  width: constraints.maxWidth,
                  height: canvasHeight,
                  child: child,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class AuthenticationInlineAction extends StatelessWidget {
  const AuthenticationInlineAction({
    required this.label,
    required this.onPressed,
    required this.style,
    this.alignment = Alignment.center,
    super.key,
  });

  final String label;
  final VoidCallback onPressed;
  final TextStyle style;
  final AlignmentGeometry alignment;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      excludeSemantics: true,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              minWidth: AuratioSizing.minimumTouchTarget,
              minHeight: AuratioSizing.minimumTouchTarget,
            ),
            child: Align(
              alignment: alignment,
              child: Text(label, style: style),
            ),
          ),
        ),
      ),
    );
  }
}
