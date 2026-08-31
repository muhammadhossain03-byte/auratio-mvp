import 'package:flutter/material.dart';

import '../tokens/auratio_colors.dart';
import '../tokens/auratio_metrics.dart';
import '../tokens/auratio_typography.dart';

enum AuratioChipTabSize {
  compact, // 32.0px (Tracks filter tabs)
  small, // 34.0px (Path badges / pills)
  medium, // 44.0px (Standard touch-target tab)
}

class AuratioChipTab extends StatelessWidget {
  const AuratioChipTab({
    required this.label,
    required this.selected,
    this.onPressed,
    this.size = AuratioChipTabSize.small,
    this.presentationOnly = false,
    super.key,
  });

  final String label;
  final bool selected;
  final VoidCallback? onPressed;
  final AuratioChipTabSize size;

  /// When true, renders purely as a presentation pill/badge (matching Figma 32/34px
  /// visual dimensions) without interactive touch-target padding or disabled styling.
  final bool presentationOnly;

  @override
  Widget build(BuildContext context) {
    final visualHeight = switch (size) {
      AuratioChipTabSize.compact => 32.0,
      AuratioChipTabSize.small => 34.0,
      AuratioChipTabSize.medium => AuratioSizing.minimumTouchTarget,
    };
    final horizontalPadding = switch (size) {
      AuratioChipTabSize.compact => AuratioSpacing.md,
      AuratioChipTabSize.small => AuratioSpacing.md,
      AuratioChipTabSize.medium => AuratioSpacing.lg,
    };

    final visualPill = DecoratedBox(
      decoration: ShapeDecoration(
        color: selected
            ? AuratioColors.actionPrimaryBackground
            : AuratioColors.surfaceDefault,
        shape: StadiumBorder(
          side: selected
              ? BorderSide.none
              : const BorderSide(color: AuratioColors.borderStrong),
        ),
      ),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: visualHeight,
          minWidth: visualHeight,
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          child: Center(
            widthFactor: 1,
            child: Text(
              label,
              style: AuratioTypography.labelMedium.copyWith(
                color: selected
                    ? AuratioColors.textOnBrand
                    : AuratioColors.textSecondary,
                fontSize: size == AuratioChipTabSize.compact ? 13 : null,
              ),
            ),
          ),
        ),
      ),
    );

    if (presentationOnly) {
      return Semantics(label: label, selected: selected, child: visualPill);
    }

    final minTargetHeight = switch (size) {
      AuratioChipTabSize.compact => 32.0,
      _ => AuratioSizing.minimumTouchTarget,
    };

    return Semantics(
      button: true,
      enabled: onPressed != null,
      excludeSemantics: true,
      label: label,
      selected: selected,
      child: Opacity(
        opacity: onPressed == null ? AuratioOpacity.disabled : 1,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            customBorder: const StadiumBorder(),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minWidth: AuratioSizing.minimumTouchTarget,
                minHeight: minTargetHeight,
              ),
              child: Center(widthFactor: 1.0, child: visualPill),
            ),
          ),
        ),
      ),
    );
  }
}
