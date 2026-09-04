import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_navigation.dart';
import '../../../onboarding/application/path_selection_controller.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../domain/event_catalog.dart';
import '../widgets/event_discovery_card.dart';

class EventsDiscoveryScreen extends ConsumerStatefulWidget {
  const EventsDiscoveryScreen({super.key});

  static const screenKey = Key('events-discovery-screen');
  static const headingKey = Key('events-discovery-heading');
  static const introKey = Key('events-discovery-intro');
  static const filterCardKey = Key('events-discovery-filter-card');
  static const filterDivisionKey = Key('events-discovery-filter-division');
  static const filterPathKey = Key('events-discovery-filter-path');
  static const filterDateKey = Key('events-discovery-filter-date');
  static const relevantEventsLabelKey = Key(
    'events-discovery-relevant-events-label',
  );
  static const eventCard1Key = Key('events-discovery-event-card-1');
  static const eventCard2Key = Key('events-discovery-event-card-2');
  static const readOnlyCardKey = Key('events-discovery-read-only-card');
  static const emptyStateKey = Key('events-discovery-empty-state');
  static const bottomNavKey = Key('events-discovery-bottom-nav');

  static const divisionOptions = [
    'Dhaka Division',
    'Chattogram Division',
    'Rajshahi Division',
    'Khulna Division',
    'Barishal Division',
    'Sylhet Division',
    'Rangpur Division',
    'Mymensingh Division',
  ];

  static const pathOptions = [
    'All Paths',
    'Public Speaking',
    'Professional Presenting',
    'Content Creation',
  ];

  static const dateOptions = ['Upcoming', 'All Dates'];

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.surfaceDefault,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  ConsumerState<EventsDiscoveryScreen> createState() =>
      _EventsDiscoveryScreenState();
}

class _EventsDiscoveryScreenState extends ConsumerState<EventsDiscoveryScreen> {
  String _selectedDivision = 'Dhaka Division';
  String _selectedPathFilter = 'All Paths';
  String _selectedDateFilter = 'Upcoming';

  static (double, double, double) _calculatePillWidths({
    required String division,
    required String path,
    required String date,
  }) {
    final isLongDivision = division != 'Dhaka Division';
    final isSpecificPath = path != 'All Paths';

    if (!isLongDivision && !isSpecificPath) {
      // Default canonical state: exact Figma metadata 102.0 each
      return (102.0, 102.0, 102.0);
    }

    if (isLongDivision && !isSpecificPath) {
      // Long division expands, short path and date contract
      return (136.0, 84.0, 86.0);
    }

    if (!isLongDivision && isSpecificPath) {
      // Specific path expands, date contracts, division stays 102
      return (102.0, 114.0, 90.0);
    }

    // Both long division and specific path:
    return (112.0, 110.0, 84.0);
  }

  static String _pathDisplayLabel(String path) {
    if (path == 'Professional Presenting') {
      return 'Prof. Presenting';
    }
    return path;
  }

  static String _divisionDisplayLabel(
    String division, {
    required bool isCombined,
  }) {
    if (isCombined && division.endsWith(' Division')) {
      return '${division.substring(0, division.length - 9)} Div.';
    }
    return division;
  }

  Future<void> _showOptionSelector({
    required String title,
    required List<String> options,
    required String selectedOption,
    required ValueChanged<String> onSelected,
  }) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AuratioColors.surfaceDefault,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 8,
                  ),
                  child: Text(
                    title,
                    style: AuratioTypography.headingMedium.copyWith(
                      color: AuratioColors.textPrimary,
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const Divider(height: 1, color: AuratioColors.borderDefault),
                Flexible(
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: options.map((option) {
                        final isSelected = option == selectedOption;
                        return ListTile(
                          title: Text(
                            option,
                            style: AuratioTypography.bodyMedium.copyWith(
                              color: isSelected
                                  ? AuratioColors.backgroundBrand
                                  : AuratioColors.textPrimary,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                          trailing: isSelected
                              ? const Icon(
                                  Icons.check,
                                  color: AuratioColors.backgroundBrand,
                                  size: 20,
                                )
                              : null,
                          onTap: () {
                            onSelected(option);
                            Navigator.of(bottomSheetContext).pop();
                          },
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final userPaths = ref.watch(selectedPathsProvider);

    final displayedEvents = AuratioEventCatalog.all.where((event) {
      // 1. Division filter
      if (event.division != _selectedDivision) {
        return false;
      }

      // 2. Path filter
      if (_selectedPathFilter == 'All Paths') {
        if (!userPaths.contains(event.relevantPath)) {
          return false;
        }
      } else {
        if (event.relevantPath.label != _selectedPathFilter) {
          return false;
        }
        if (!userPaths.contains(event.relevantPath)) {
          return false;
        }
      }

      // 3. Date filter
      if (_selectedDateFilter == 'Upcoming') {
        if (!event.date.toLowerCase().contains('upcoming')) {
          return false;
        }
      }

      return true;
    }).toList();

    final isCombined =
        _selectedDivision != 'Dhaka Division' &&
        _selectedPathFilter != 'All Paths';
    final (divWidth, pathWidth, dateWidth) = _calculatePillWidths(
      division: _selectedDivision,
      path: _selectedPathFilter,
      date: _selectedDateFilter,
    );

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: EventsDiscoveryScreen.screenKey,
      value: EventsDiscoveryScreen._overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          bottom: false,
          child: Column(
            children: [
              const AuratioScreenHeader(title: 'Events', showBack: false),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 28),

                      // Heading (y=120, w=350, h=32)
                      SizedBox(
                        width: double.infinity,
                        child: Text(
                          'Events for you',
                          key: EventsDiscoveryScreen.headingKey,
                          style: AuratioTypography.headingLarge.copyWith(
                            color: AuratioColors.textPrimary,
                            fontSize: 24,
                            height: 32 / 24,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Intro copy (y=160, w=350, h=38)
                      Text(
                        'Bangladesh-only events are matched to your saved Division and selected Auratio paths.',
                        key: EventsDiscoveryScreen.introKey,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Filter Card (y=214, w=350, h=142)
                      SizedBox(
                        key: EventsDiscoveryScreen.filterCardKey,
                        width: double.infinity,
                        height: 142,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(13, 13, 13, 13),
                          decoration: BoxDecoration(
                            color: AuratioColors.brandBlue50,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Filters',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                'Bangladesh-only MVP • refine your results',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  // Division Filter (Rect(34, 278, 102, 40) at default)
                                  _FilterPill(
                                    key:
                                        EventsDiscoveryScreen.filterDivisionKey,
                                    width: divWidth,
                                    label: _divisionDisplayLabel(
                                      _selectedDivision,
                                      isCombined: isCombined,
                                    ),
                                    semanticLabel:
                                        'Division: $_selectedDivision',
                                    onTap: () => _showOptionSelector(
                                      title: 'Select Division',
                                      options:
                                          EventsDiscoveryScreen.divisionOptions,
                                      selectedOption: _selectedDivision,
                                      onSelected: (val) => setState(
                                        () => _selectedDivision = val,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // Path Filter (Rect(144, 278, 102, 40) at default)
                                  _FilterPill(
                                    key: EventsDiscoveryScreen.filterPathKey,
                                    width: pathWidth,
                                    label: _pathDisplayLabel(
                                      _selectedPathFilter,
                                    ),
                                    semanticLabel: 'Path: $_selectedPathFilter',
                                    onTap: () => _showOptionSelector(
                                      title: 'Select Path',
                                      options:
                                          EventsDiscoveryScreen.pathOptions,
                                      selectedOption: _selectedPathFilter,
                                      onSelected: (val) => setState(
                                        () => _selectedPathFilter = val,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // Date Filter (Rect(254, 278, 102, 40) at default)
                                  _FilterPill(
                                    key: EventsDiscoveryScreen.filterDateKey,
                                    width: dateWidth,
                                    label: _selectedDateFilter,
                                    semanticLabel: 'Date: $_selectedDateFilter',
                                    onTap: () => _showOptionSelector(
                                      title: 'Select Date',
                                      options:
                                          EventsDiscoveryScreen.dateOptions,
                                      selectedOption: _selectedDateFilter,
                                      onSelected: (val) => setState(
                                        () => _selectedDateFilter = val,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Section Label (y=374, w=350, h=20)
                      SizedBox(
                        key: EventsDiscoveryScreen.relevantEventsLabelKey,
                        width: double.infinity,
                        height: 20,
                        child: Text(
                          'RELEVANT EVENTS',
                          style: AuratioTypography.caption.copyWith(
                            color: AuratioColors.neutral500,
                            fontSize: 11,
                            height: 16 / 11,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),

                      const SizedBox(height: 6),

                      if (displayedEvents.isEmpty) ...[
                        Container(
                          key: EventsDiscoveryScreen.emptyStateKey,
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(
                            vertical: 36,
                            horizontal: 20,
                          ),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceDefault,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'No matching events',
                                style: AuratioTypography.headingMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'No events match your current filter selection.',
                                textAlign: TextAlign.center,
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 13,
                                  height: 18 / 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else ...[
                        for (int i = 0; i < displayedEvents.length; i++) ...[
                          if (i > 0) const SizedBox(height: 18),
                          EventDiscoveryCard(
                            key:
                                displayedEvents[i].slug ==
                                    'public-speaking-summit'
                                ? EventsDiscoveryScreen.eventCard1Key
                                : EventsDiscoveryScreen.eventCard2Key,
                            title: displayedEvents[i].title,
                            divisionAndDate:
                                '${displayedEvents[i].division} • ${displayedEvents[i].date}',
                            relevantPath:
                                'Relevant path: ${displayedEvents[i].relevantPath.label}',
                            onTap: () => context.push(
                              '/events/${displayedEvents[i].slug}',
                            ),
                          ),
                        ],
                      ],

                      const SizedBox(height: 18),

                      // Read-Only Directory Card (y=660, w=350, h=82)
                      SizedBox(
                        key: EventsDiscoveryScreen.readOnlyCardKey,
                        width: double.infinity,
                        height: 82,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceSubtle,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Read-only directory',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'End users can view event information only; management is admin-controlled.',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
              AuratioMobileNavigationBar(
                key: EventsDiscoveryScreen.bottomNavKey,
                destinations: canonicalMobileDestinations,
                currentIndex: 0,
                interactiveIndices: const {0, 1, 2, 3},
                onDestinationSelected: (index) {
                  if (index == 0) {
                    context.go(AppRoutePaths.home);
                  } else if (index == 1) {
                    context.go(AppRoutePaths.tracks);
                  } else if (index == 2) {
                    context.go(AppRoutePaths.progress);
                  } else if (index == 3) {
                    context.go(AppRoutePaths.profile);
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterPill extends StatelessWidget {
  const _FilterPill({
    required this.label,
    this.semanticLabel,
    this.onTap,
    this.width,
    super.key,
  });

  final String label;
  final String? semanticLabel;
  final VoidCallback? onTap;
  final double? width;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      enabled: onTap != null,
      label: semanticLabel ?? label,
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Container(
          width: width ?? 102,
          height: 40,
          padding: const EdgeInsets.fromLTRB(6, 0, 4, 0),
          alignment: Alignment.centerLeft,
          decoration: BoxDecoration(
            color: AuratioColors.surfaceDefault,
            border: Border.all(color: const Color(0xFFC9D6E7)),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.backgroundBrand,
                    fontSize: 11,
                    height: 16 / 11,
                    fontWeight: FontWeight.w500,
                    letterSpacing: -0.1,
                  ),
                ),
              ),
              const SizedBox(width: 2),
              const _DropdownTriangle(),
            ],
          ),
        ),
      ),
    );
  }
}

class _DropdownTriangle extends StatelessWidget {
  const _DropdownTriangle();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(6, 4),
      painter: _TrianglePainter(color: AuratioColors.backgroundBrand),
    );
  }
}

class _TrianglePainter extends CustomPainter {
  const _TrianglePainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width / 2, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _TrianglePainter oldDelegate) =>
      oldDelegate.color != color;
}
