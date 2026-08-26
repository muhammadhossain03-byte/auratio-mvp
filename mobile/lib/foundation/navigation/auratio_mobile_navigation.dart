import 'package:flutter/material.dart';

import '../design_system/tokens/auratio_colors.dart';
import '../design_system/tokens/auratio_metrics.dart';
import '../design_system/tokens/auratio_typography.dart';

@immutable
class AuratioMobileDestination {
  const AuratioMobileDestination({required this.label, required this.icon});

  final String label;
  final Widget icon;
}

class AuratioMobileNavigationItem extends StatelessWidget {
  const AuratioMobileNavigationItem({
    required this.destination,
    required this.active,
    required this.onTap,
    super.key,
  });

  final AuratioMobileDestination destination;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final foreground = active
        ? AuratioColors.textPrimary
        : AuratioColors.textSecondary;

    return Semantics(
      button: true,
      selected: active,
      label: destination.label,
      child: InkResponse(
        onTap: onTap,
        radius: AuratioSizing.minimumTouchTarget / 2,
        child: SizedBox(
          width: 78,
          height: 60,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                width: 36,
                height: 30,
                decoration: BoxDecoration(
                  color: active
                      ? AuratioColors.surfaceBrandSoft
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(AuratioRadii.pill),
                ),
                child: IconTheme(
                  data: IconThemeData(color: foreground, size: 20),
                  child: Center(child: destination.icon),
                ),
              ),
              const SizedBox(height: AuratioSpacing.xxs),
              Text(
                destination.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AuratioTypography.caption.copyWith(color: foreground),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AuratioMobileNavigationBar extends StatelessWidget {
  const AuratioMobileNavigationBar({
    required this.destinations,
    required this.currentIndex,
    required this.onDestinationSelected,
    super.key,
  }) : assert(destinations.length > 1),
       assert(currentIndex >= 0 && currentIndex < destinations.length);

  final List<AuratioMobileDestination> destinations;
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border(top: BorderSide(color: AuratioColors.borderDefault)),
      ),
      child: SizedBox(
        height: AuratioSizing.mobileNavigationHeight,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AuratioSpacing.md),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              for (var index = 0; index < destinations.length; index++)
                AuratioMobileNavigationItem(
                  destination: destinations[index],
                  active: index == currentIndex,
                  onTap: () => onDestinationSelected(index),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
