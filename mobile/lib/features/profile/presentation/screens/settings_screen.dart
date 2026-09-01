import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  static const screenKey = ValueKey('settings-screen');
  static const accountCardKey = ValueKey('settings-account-card');
  static const eventPreferencesCardKey =
      ValueKey('settings-event-preferences-card');
  static const managePathsLinkKey = ValueKey('settings-manage-paths-link');
  static const privacyCardKey = ValueKey('settings-privacy-card');
  static const signOutVisualKey = ValueKey('settings-sign-out-visual');
  static const backToProfileButtonKey =
      ValueKey('settings-back-to-profile-button');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: screenKey,
      backgroundColor: AuratioColors.backgroundApp,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            AuratioScreenHeader(
              title: 'Settings',
              showBack: true,
              onBack: () => context.go(AppRoutePaths.profile),
            ),
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 28),

                      // Heading (y=120, w=350)
                      Text(
                        'Account & app settings',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: const Color(0xFF111827),
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Account Card (y=174, w=350, h=100)
                      SizedBox(
                        key: accountCardKey,
                        width: double.infinity,
                        height: 100,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 32, 10),
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
                                'Account',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: const Color(0xFF111827),
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Email: alex@example.com',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF4E5968),
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Role: End user',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF4E5968),
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

                      // Event Discovery Preferences Card (y=292, w=350, h=164)
                      SizedBox(
                        key: eventPreferencesCardKey,
                        width: double.infinity,
                        height: 164,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 12, 30, 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF3F8FE),
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Event discovery preferences',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                'Auratio lists Bangladesh events only and uses your saved Division plus selected paths for relevance.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF4E5968),
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                'Country: Bangladesh (MVP)',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF111827),
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'Division: Dhaka Division',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF111827),
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 3),
                              GestureDetector(
                                key: managePathsLinkKey,
                                onTap: () =>
                                    context.push(AppRoutePaths.managePaths),
                                child: Text(
                                  'Manage selected Paths  →',
                                  style: AuratioTypography.caption.copyWith(
                                    color: const Color(0xFF6B788A),
                                    fontSize: 11,
                                    height: 16 / 11,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Submission Privacy & Retention Card (y=474, w=350, h=154)
                      SizedBox(
                        key: privacyCardKey,
                        width: double.infinity,
                        height: 154,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 12, 32, 6),
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
                                'Submission privacy & retention',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: const Color(0xFF111827),
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                'Performance videos are temporary evaluation artifacts. They remain through evaluation/moderation and are deleted after the final Approved or Rejected decision.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF4E5968),
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Final .docx reports remain accessible after video deletion.',
                                style: AuratioTypography.caption.copyWith(
                                  color: const Color(0xFF6B788A),
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 42),

                      // Sign Out Visual (y=670, w=350, h=48) — PRESENTATION ONLY
                      Container(
                        key: signOutVisualKey,
                        width: double.infinity,
                        height: 48,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AuratioColors.surfaceDefault,
                          border: Border.all(
                            color: const Color(0xFFC8D2E0),
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Sign Out',
                          style: AuratioTypography.labelLarge.copyWith(
                            color: AuratioColors.backgroundBrand,
                            fontSize: 14,
                            height: 20 / 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Back to Profile CTA (y=730, w=350, h=48)
                      SizedBox(
                        key: backToProfileButtonKey,
                        width: double.infinity,
                        height: 48,
                        child: AuratioButton(
                          label: 'Back to Profile',
                          variant: AuratioButtonVariant.primary,
                          size: AuratioButtonSize.medium,
                          onPressed: () => context.go(AppRoutePaths.profile),
                        ),
                      ),

                      const SizedBox(height: 20),
                    ],
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
