import 'package:flutter/material.dart';

import '../tokens/auratio_colors.dart';
import '../tokens/auratio_metrics.dart';
import '../tokens/auratio_typography.dart';

enum AuratioChipTabSize { small, medium }

class AuratioChipTab extends StatelessWidget {
  const AuratioChipTab({
    required this.label,
    required this.selected,
    this.onPressed,
    this.size = AuratioChipTabSize.small,
    super.key,
  });

  final String label;
  final bool selected;
  final VoidCallback? onPressed;
  final AuratioChipTabSize size;

  @override
  Widget build(BuildContext context) {
    final visualHeight = switch (size) {
      AuratioChipTabSize.small => 34.0,
      AuratioChipTabSize.medium => AuratioSizing.minimumTouchTarget,
    };
    final horizontalPadding = switch (size) {
      AuratioChipTabSize.small => AuratioSpacing.md,
      AuratioChipTabSize.medium => AuratioSpacing.lg,
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
              constraints: const BoxConstraints(
                minWidth: AuratioSizing.minimumTouchTarget,
                minHeight: AuratioSizing.minimumTouchTarget,
              ),
              child: Center(
                widthFactor: 1.0,
                child: DecoratedBox(
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
                    constraints: BoxConstraints(minHeight: visualHeight),
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: horizontalPadding,
                      ),
                      child: Center(
                        widthFactor: 1,
                        child: Text(
                          label,
                          style: AuratioTypography.labelMedium.copyWith(
                            color: selected
                                ? AuratioColors.textOnBrand
                                : AuratioColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
