import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_navigation.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../widgets/event_discovery_card.dart';

class EventsDiscoveryScreen extends StatelessWidget {
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
  static const bottomNavKey = Key('events-discovery-bottom-nav');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.surfaceDefault,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: screenKey,
      value: _overlayStyle,
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
                          key: headingKey,
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
                        key: introKey,
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
                        key: filterCardKey,
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
                                  // Division Filter (Rect(34, 278, 102, 40))
                                  const _FilterPill(
                                    key: filterDivisionKey,
                                    label: 'Dhaka Division',
                                  ),
                                  const SizedBox(width: 8),

                                  // Path Filter (Rect(144, 278, 102, 40))
                                  const _FilterPill(
                                    key: filterPathKey,
                                    label: 'All Paths',
                                  ),
                                  const SizedBox(width: 8),

                                  // Date Filter (Rect(254, 278, 102, 40))
                                  const _FilterPill(
                                    key: filterDateKey,
                                    label: 'Upcoming',
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
                        key: relevantEventsLabelKey,
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

                      // Event Card 1 (y=400, w=350, h=112)
                      EventDiscoveryCard(
                        key: eventCard1Key,
                        title: 'Public Speaking Summit',
                        divisionAndDate: 'Dhaka Division • Upcoming date',
                        relevantPath: 'Relevant path: Public Speaking',
                        onTap: () => context.push(AppRoutePaths.eventDetails),
                      ),

                      const SizedBox(height: 18),

                      // Event Card 2 (y=530, w=350, h=112)
                      EventDiscoveryCard(
                        key: eventCard2Key,
                        title: 'Presentation Practice Meetup',
                        divisionAndDate: 'Dhaka Division • Upcoming date',
                        relevantPath: 'Relevant path: Professional Presenting',
                        onTap: () => context.push(AppRoutePaths.eventDetails),
                      ),

                      const SizedBox(height: 18),

                      // Read-Only Directory Card (y=660, w=350, h=82)
                      SizedBox(
                        key: readOnlyCardKey,
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
                key: bottomNavKey,
                destinations: canonicalMobileDestinations,
                currentIndex: 0,
                interactiveIndices: const {1, 2, 3},
                onDestinationSelected: (index) {
                  if (index == 1) {
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
    super.key,
  });

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 102,
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      alignment: Alignment.centerLeft,
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(
          color: const Color(0xFFC9D6E7),
        ),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.backgroundBrand,
              fontSize: 11,
              height: 16 / 11,
              fontWeight: FontWeight.w500,
            ),
          ),
          const _DropdownTriangle(),
        ],
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

