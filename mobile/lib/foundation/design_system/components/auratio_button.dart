import 'package:flutter/material.dart';

import '../tokens/auratio_colors.dart';
import '../tokens/auratio_metrics.dart';
import '../tokens/auratio_typography.dart';

enum AuratioButtonVariant { primary, secondary, accent, ghost }

enum AuratioButtonSize { small, medium }

class AuratioButton extends StatelessWidget {
  const AuratioButton({
    required this.label,
    required this.onPressed,
    this.variant = AuratioButtonVariant.primary,
    this.size = AuratioButtonSize.medium,
    this.leading,
    this.trailing,
    this.expand = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final AuratioButtonVariant variant;
  final AuratioButtonSize size;
  final Widget? leading;
  final Widget? trailing;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final height = switch (size) {
      AuratioButtonSize.small => AuratioSizing.controlSmall,
      AuratioButtonSize.medium => AuratioSizing.controlMedium,
    };
    final horizontalPadding = switch (size) {
      AuratioButtonSize.small => AuratioSpacing.lg,
      AuratioButtonSize.medium => AuratioSpacing.xl,
    };

    final button = TextButton(
      onPressed: onPressed,
      style: ButtonStyle(
        minimumSize: WidgetStatePropertyAll(Size(0, height)),
        padding: WidgetStatePropertyAll(
          EdgeInsets.symmetric(horizontal: horizontalPadding),
        ),
        elevation: const WidgetStatePropertyAll(0),
        backgroundColor: WidgetStateProperty.resolveWith(_backgroundColor),
        foregroundColor: WidgetStateProperty.resolveWith(_foregroundColor),
        overlayColor: WidgetStatePropertyAll(
          AuratioColors.brandBlue500.withValues(alpha: 0.12),
        ),
        side: WidgetStateProperty.resolveWith(_borderSide),
        shape: WidgetStatePropertyAll(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AuratioRadii.md),
          ),
        ),
        textStyle: const WidgetStatePropertyAll(AuratioTypography.labelLarge),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (leading case final leading?) ...[
            leading,
            const SizedBox(width: AuratioSpacing.sm),
          ],
          Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
          if (trailing case final trailing?) ...[
            const SizedBox(width: AuratioSpacing.sm),
            trailing,
          ],
        ],
      ),
    );

    return SizedBox(width: expand ? double.infinity : null, child: button);
  }

  Color _backgroundColor(Set<WidgetState> states) {
    if (states.contains(WidgetState.disabled)) {
      return variant == AuratioButtonVariant.ghost
          ? Colors.transparent
          : AuratioColors.actionDisabledBackground;
    }
    return switch (variant) {
      AuratioButtonVariant.primary => AuratioColors.actionPrimaryBackground,
      AuratioButtonVariant.secondary => AuratioColors.actionSecondaryBackground,
      AuratioButtonVariant.accent => AuratioColors.actionAccentBackground,
      AuratioButtonVariant.ghost => Colors.transparent,
    };
  }

  Color _foregroundColor(Set<WidgetState> states) {
    if (states.contains(WidgetState.disabled)) {
      return AuratioColors.actionDisabledForeground;
    }
    return switch (variant) {
      AuratioButtonVariant.primary => AuratioColors.actionPrimaryForeground,
      AuratioButtonVariant.secondary => AuratioColors.actionSecondaryForeground,
      AuratioButtonVariant.accent => AuratioColors.actionAccentForeground,
      AuratioButtonVariant.ghost => AuratioColors.actionSecondaryForeground,
    };
  }

  BorderSide _borderSide(Set<WidgetState> states) {
    if (states.contains(WidgetState.focused)) {
      return const BorderSide(
        color: AuratioColors.borderFocus,
        width: AuratioBorders.emphasized,
      );
    }
    if (variant == AuratioButtonVariant.secondary) {
      return const BorderSide(color: AuratioColors.borderStrong);
    }
    return BorderSide.none;
  }
}
