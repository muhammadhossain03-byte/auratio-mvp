import 'package:flutter/material.dart';

import '../design_system/tokens/auratio_colors.dart';
import '../design_system/tokens/auratio_metrics.dart';
import '../design_system/tokens/auratio_typography.dart';

/// Component measurements read from the canonical v1.8 mobile-navigation
/// component. These are layout measurements, not formal Figma variables.
abstract final class AuratioMobileNavigationLayout {
  static const barHeight = 74.0;
  static const itemWidth = 78.0;
  static const itemHeight = 60.0;
  static const iconShellWidth = 36.0;
  static const iconShellHeight = 30.0;
  static const iconSize = 20.0;
}

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
      enabled: true,
      excludeSemantics: true,
      selected: active,
      label: destination.label,
      child: InkResponse(
        onTap: onTap,
        radius: AuratioSizing.minimumTouchTarget / 2,
        child: SizedBox(
          width: AuratioMobileNavigationLayout.itemWidth,
          height: AuratioMobileNavigationLayout.itemHeight,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                width: AuratioMobileNavigationLayout.iconShellWidth,
                height: AuratioMobileNavigationLayout.iconShellHeight,
                decoration: BoxDecoration(
                  color: active
                      ? AuratioColors.surfaceBrandSoft
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(AuratioRadii.pill),
                ),
                child: IconTheme(
                  data: IconThemeData(
                    color: foreground,
                    size: AuratioMobileNavigationLayout.iconSize,
                  ),
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
    final bottomSystemInset = MediaQuery.viewPaddingOf(context).bottom;

    return DecoratedBox(
      decoration: const BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border(top: BorderSide(color: AuratioColors.borderDefault)),
      ),
      child: Padding(
        padding: EdgeInsets.only(bottom: bottomSystemInset),
        child: SizedBox(
          height: AuratioMobileNavigationLayout.barHeight,
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
      ),
    );
  }
}
