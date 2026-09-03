import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class EventDetailsScreen extends StatelessWidget {
  const EventDetailsScreen({super.key});

  static const screenKey = Key('event-details-screen');
  static const titleKey = Key('event-details-title');
  static const supportingTextKey = Key('event-details-supporting-text');
  static const eventInfoCardKey = Key('event-details-info-card');
  static const aboutCardKey = Key('event-details-about-card');
  static const whyShownCardKey = Key('event-details-why-shown-card');
  static const backToEventsButtonKey = Key(
    'event-details-back-to-events-button',
  );

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
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Event Details',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.events),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 28),

                      // Title (y=120, w=350, h=32)
                      SizedBox(
                        width: double.infinity,
                        child: Text(
                          'Public Speaking Summit',
                          key: titleKey,
                          style: AuratioTypography.headingLarge.copyWith(
                            color: AuratioColors.textPrimary,
                            fontSize: 24,
                            height: 32 / 24,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),

                      const SizedBox(height: 6),

                      // Supporting text (y=158, w=350, h=18)
                      Text(
                        'Admin-curated event information',
                        key: supportingTextKey,
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.neutral500,
                          fontSize: 12,
                          height: 18 / 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),

                      const SizedBox(height: 34),

                      // Event Information Card (y=210, w=350, h=160)
                      SizedBox(
                        key: eventInfoCardKey,
                        width: double.infinity,
                        height: 160,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceDefault,
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
                                'Event information',
                                style: AuratioTypography.headingSmall.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              _buildInfoRow('Date', 'Upcoming date'),
                              _buildInfoRow(
                                'Location',
                                'Dhaka Division, Bangladesh',
                              ),
                              _buildInfoRow('Relevant path', 'Public Speaking'),
                              _buildInfoRow(
                                'Source',
                                'Published by Auratio admin',
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // About This Event Card (y=390, w=350, h=140)
                      SizedBox(
                        key: aboutCardKey,
                        width: double.infinity,
                        height: 140,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
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
                                'About this event',
                                style: AuratioTypography.headingSmall.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                'Event description and organizer-provided information appear here. End users do not manage the event through Auratio.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Why This Event Is Shown Card (y=548, w=350, h=112)
                      SizedBox(
                        key: whyShownCardKey,
                        width: double.infinity,
                        height: 112,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceDefault,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Why this event is shown',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 9),
                              Text(
                                'Shown because your saved Division and selected Public Speaking path match this event.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 90),

                      // Back to Events CTA (y=750, w=350, h=48)
                      SizedBox(
                        key: backToEventsButtonKey,
                        width: double.infinity,
                        height: 48,
                        child: AuratioButton(
                          label: 'Back to Events',
                          variant: AuratioButtonVariant.secondary,
                          size: AuratioButtonSize.medium,
                          expand: true,
                          onPressed: () => context.go(AppRoutePaths.events),
                        ),
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static Widget _buildInfoRow(String label, String value) {
    return Row(
      children: [
        SizedBox(
          width: 96,
          child: Text(
            label,
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.neutral500,
              fontSize: 11,
              height: 16 / 11,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.textPrimary,
              fontSize: 11,
              height: 16 / 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
