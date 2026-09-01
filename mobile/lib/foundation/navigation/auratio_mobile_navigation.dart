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

const canonicalMobileDestinations = [
  AuratioMobileDestination(label: 'Home', icon: Icon(Icons.home_outlined)),
  AuratioMobileDestination(label: 'Tracks', icon: Icon(Icons.explore_outlined)),
  AuratioMobileDestination(
    label: 'Progress',
    icon: Icon(Icons.bar_chart_outlined),
  ),
  AuratioMobileDestination(label: 'Profile', icon: Icon(Icons.person_outline)),
];

class AuratioMobileNavigationItem extends StatelessWidget {
  const AuratioMobileNavigationItem({
    required this.destination,
    required this.active,
    this.onTap,
    super.key,
  });

  final AuratioMobileDestination destination;
  final bool active;
  final VoidCallback? onTap;

  bool get isInteractive => onTap != null;

  @override
  Widget build(BuildContext context) {
    final foreground = active
        ? AuratioColors.textPrimary
        : AuratioColors.textSecondary;

    final content = SizedBox(
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
    );

    if (onTap == null) {
      return Semantics(
        container: true,
        selected: active,
        label: destination.label,
        child: content,
      );
    }

    return Semantics(
      button: true,
      enabled: true,
      excludeSemantics: true,
      selected: active,
      label: destination.label,
      child: InkResponse(
        onTap: onTap,
        radius: AuratioSizing.minimumTouchTarget / 2,
        child: content,
      ),
    );
  }
}

class AuratioMobileNavigationBar extends StatelessWidget {
  const AuratioMobileNavigationBar({
    required this.destinations,
    required this.currentIndex,
    this.onDestinationSelected,
    this.interactiveIndices,
    super.key,
  }) : assert(destinations.length > 1),
       assert(currentIndex >= 0 && currentIndex < destinations.length);

  final List<AuratioMobileDestination> destinations;
  final int currentIndex;
  final ValueChanged<int>? onDestinationSelected;
  final Set<int>? interactiveIndices;

  bool _isIndexInteractive(int index) {
    if (onDestinationSelected == null) {
      return false;
    }
    if (interactiveIndices != null) {
      return interactiveIndices!.contains(index);
    }
    return true;
  }

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
                    onTap: _isIndexInteractive(index)
                        ? () => onDestinationSelected?.call(index)
                        : null,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
