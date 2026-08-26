import 'package:flutter/material.dart';

import '../tokens/auratio_colors.dart';
import '../tokens/auratio_metrics.dart';
import '../tokens/auratio_typography.dart';

enum AuratioStatus { processing, pending, approved, rejected }

extension on AuratioStatus {
  String get label => switch (this) {
    AuratioStatus.processing => 'Processing',
    AuratioStatus.pending => 'Pending',
    AuratioStatus.approved => 'Approved',
    AuratioStatus.rejected => 'Rejected',
  };

  Color get backgroundColor => switch (this) {
    AuratioStatus.processing => AuratioColors.statusProcessingBackground,
    AuratioStatus.pending => AuratioColors.statusPendingBackground,
    AuratioStatus.approved => AuratioColors.statusApprovedBackground,
    AuratioStatus.rejected => AuratioColors.statusRejectedBackground,
  };

  Color get foregroundColor => switch (this) {
    AuratioStatus.processing => AuratioColors.statusProcessingForeground,
    AuratioStatus.pending => AuratioColors.statusPendingForeground,
    AuratioStatus.approved => AuratioColors.statusApprovedForeground,
    AuratioStatus.rejected => AuratioColors.statusRejectedForeground,
  };
}

class AuratioStatusBadge extends StatelessWidget {
  const AuratioStatusBadge({required this.status, super.key});

  final AuratioStatus status;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      excludeSemantics: true,
      label: 'Status: ${status.label}',
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: status.backgroundColor,
          borderRadius: BorderRadius.circular(AuratioRadii.pill),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          child: Text(
            status.label,
            style: AuratioTypography.labelMedium.copyWith(
              color: status.foregroundColor,
            ),
          ),
        ),
      ),
    );
  }
}
