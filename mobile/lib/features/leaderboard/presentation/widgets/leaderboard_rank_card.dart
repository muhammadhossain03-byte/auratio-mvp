import 'package:flutter/material.dart';

import '../../../../foundation/design_system/auratio_design_system.dart';

class LeaderboardRankCard extends StatelessWidget {
  const LeaderboardRankCard({
    required this.rank,
    required this.name,
    required this.alr,
    required this.participation,
    super.key,
  });

  final String rank;
  final String name;
  final String alr;
  final String participation;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AuratioColors.surfaceDefault,
          border: Border.all(color: AuratioColors.borderDefault),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            SizedBox(
              width: 24,
              child: Text(
                rank,
                style: AuratioTypography.bodyMedium.copyWith(
                  color: AuratioColors.backgroundBrand,
                  fontSize: 13,
                  height: 18 / 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    name,
                    style: AuratioTypography.bodySmall.copyWith(
                      color: AuratioColors.textPrimary,
                      fontSize: 12,
                      height: 18 / 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    alr,
                    style: AuratioTypography.caption.copyWith(
                      color: AuratioColors.textSecondary,
                      fontSize: 11,
                      height: 16 / 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              participation,
              textAlign: TextAlign.right,
              style: AuratioTypography.caption.copyWith(
                color: AuratioColors.neutral500,
                fontSize: 11,
                height: 16 / 11,
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
