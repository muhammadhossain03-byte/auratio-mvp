import 'package:flutter/material.dart';

import '../../../../foundation/design_system/auratio_design_system.dart';

class EventDiscoveryCard extends StatelessWidget {
  const EventDiscoveryCard({
    required this.title,
    required this.divisionAndDate,
    required this.relevantPath,
    required this.onTap,
    super.key,
  });

  final String title;
  final String divisionAndDate;
  final String relevantPath;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 112,
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
        decoration: BoxDecoration(
          color: AuratioColors.surfaceDefault,
          border: Border.all(color: AuratioColors.borderDefault),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: AuratioTypography.headingSmall.copyWith(
                color: AuratioColors.textPrimary,
                fontSize: 14,
                height: 20 / 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              divisionAndDate,
              style: AuratioTypography.caption.copyWith(
                color: AuratioColors.neutral500,
                fontSize: 11,
                height: 16 / 11,
                fontWeight: FontWeight.w400,
              ),
            ),
            Text(
              relevantPath,
              style: AuratioTypography.caption.copyWith(
                color: AuratioColors.textSecondary,
                fontSize: 11,
                height: 16 / 11,
                fontWeight: FontWeight.w500,
              ),
            ),
            Semantics(
              button: true,
              enabled: true,
              label: 'View event details for $title',
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: onTap,
                child: Text(
                  'View event details  →',
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.backgroundBrand,
                    fontSize: 11,
                    height: 16 / 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
