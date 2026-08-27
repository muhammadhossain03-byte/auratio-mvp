import 'package:flutter/material.dart';

import '../tokens/auratio_colors.dart';
import '../tokens/auratio_elevation.dart';
import '../tokens/auratio_metrics.dart';
import '../tokens/auratio_typography.dart';

enum AuratioCardTone { defaultTone, brandSoft, subtle }

enum AuratioCardElevation { flat, raised }

class AuratioCard extends StatelessWidget {
  const AuratioCard({
    this.title,
    this.body,
    this.child,
    this.tone = AuratioCardTone.defaultTone,
    this.elevation = AuratioCardElevation.flat,
    this.padding = const EdgeInsets.all(AuratioSpacing.xl),
    this.borderColor,
    super.key,
  }) : assert(
         child != null || title != null || body != null,
         'Provide card content.',
       );

  final String? title;
  final String? body;
  final Widget? child;
  final AuratioCardTone tone;
  final AuratioCardElevation elevation;
  final EdgeInsetsGeometry padding;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    final backgroundColor = switch (tone) {
      AuratioCardTone.defaultTone => AuratioColors.surfaceDefault,
      AuratioCardTone.brandSoft => AuratioColors.surfaceBrandSoft,
      AuratioCardTone.subtle => AuratioColors.surfaceSubtle,
    };

    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor,
        border: Border.all(color: borderColor ?? AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
        boxShadow: elevation == AuratioCardElevation.raised
            ? AuratioElevation.level200
            : null,
      ),
      child: Padding(
        padding: padding,
        child:
            child ??
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title case final title?)
                  Text(
                    title,
                    style: AuratioTypography.titleMedium.copyWith(
                      color: AuratioColors.textPrimary,
                    ),
                  ),
                if (title != null && body != null)
                  const SizedBox(height: AuratioSpacing.sm),
                if (body case final body?)
                  Text(
                    body,
                    style: AuratioTypography.bodyMedium.copyWith(
                      color: AuratioColors.textSecondary,
                    ),
                  ),
              ],
            ),
      ),
    );
  }
}
