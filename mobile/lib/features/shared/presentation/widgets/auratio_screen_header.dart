import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../foundation/design_system/auratio_design_system.dart';

class AuratioScreenHeader extends StatelessWidget {
  const AuratioScreenHeader({
    required this.title,
    this.showBack = false,
    this.onBack,
    super.key,
  });

  static const figmaHeight = 92.0;

  final String title;
  final bool showBack;
  final VoidCallback? onBack;

  static double heightFor(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;
    return math.max(figmaHeight, topInset + 68);
  }

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;
    final titleTop = math.max(40.0, topInset + 16);

    return SizedBox(
      height: heightFor(context),
      child: ColoredBox(
        color: AuratioColors.backgroundBrand,
        child: Stack(
          children: [
            if (showBack)
              Positioned(
                left: AuratioSpacing.xs,
                top: titleTop - 12,
                child: _BackAffordance(onPressed: onBack),
              ),
            Positioned(
              left: showBack ? 48 : AuratioSpacing.xl,
              right: AuratioSpacing.xl,
              top: titleTop,
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AuratioTypography.titleMedium.copyWith(
                  color: AuratioColors.textOnBrand,
                  fontSize: 17,
                  height: 24 / 17,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BackAffordance extends StatelessWidget {
  const _BackAffordance({this.onPressed});

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final icon = Text(
      '‹',
      textAlign: TextAlign.center,
      style: AuratioTypography.headingLarge.copyWith(
        color: AuratioColors.textOnBrand,
        fontSize: 28,
        height: 40 / 28,
      ),
    );

    if (onPressed == null) {
      return ExcludeSemantics(
        child: SizedBox.square(
          dimension: AuratioSizing.minimumTouchTarget,
          child: Center(child: icon),
        ),
      );
    }

    return Semantics(
      button: true,
      label: 'Back',
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onPressed,
        child: SizedBox.square(
          dimension: AuratioSizing.minimumTouchTarget,
          child: Center(child: icon),
        ),
      ),
    );
  }
}
