import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_navigation.dart';
import '../../../onboarding/application/path_selection_controller.dart';
import '../../../onboarding/domain/auratio_path.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({this.showThreePaths = false, super.key});

  final bool showThreePaths;

  static const screenKey = ValueKey('profile-screen');
  static const avatarKey = ValueKey('profile-avatar');
  static const accountCardKey = ValueKey('profile-account-card');
  static const selectedPathsCardKey = ValueKey('profile-selected-paths-card');
  static const managePathsLinkKey = ValueKey('profile-manage-paths-link');
  static const activityCardKey = ValueKey('profile-activity-card');
  static const privateProgressLinkKey = ValueKey(
    'profile-private-progress-link',
  );
  static const approvedHistoryLinkKey = ValueKey(
    'profile-approved-history-link',
  );
  static const leaderboardsLinkKey = ValueKey('profile-leaderboards-link');
  static const eventsLinkKey = ValueKey('profile-events-link');
  static const settingsButtonKey = ValueKey('profile-settings-button');
  static const bottomNavKey = ValueKey('profile-bottom-nav');

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedPaths = ref.watch(selectedPathsProvider);
    final isThreePaths = savedPaths.length >= 3;
    final orderedPaths = AuratioPath.values.where(savedPaths.contains).toList();
    return Scaffold(
      key: screenKey,
      backgroundColor: AuratioColors.backgroundApp,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            const AuratioScreenHeader(title: 'Profile', showBack: false),
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 28),

                      // Profile Identity (Avatar + Name/Role)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Avatar (20, 120, 64, 64)
                          Container(
                            key: avatarKey,
                            width: 64,
                            height: 64,
                            decoration: const BoxDecoration(
                              color: Color(0xFFB2CAEB),
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'AM',
                              style: AuratioTypography.titleMedium.copyWith(
                                color: AuratioColors.backgroundBrand,
                                fontSize: 16,
                                height: 22 / 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),

                          // Name & Role (x=100)
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Alex Morgan',
                                style: AuratioTypography.headingMedium.copyWith(
                                  color: const Color(0xFF111827),
                                  fontSize: 22,
                                  height: 30 / 22,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'End user',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF6B788A),
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 30),

                      // Account Card (y=214, w=350, h=116)
                      SizedBox(
                        key: accountCardKey,
                        width: double.infinity,
                        height: 116,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
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
                                'alex@example.com',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: const Color(0xFF4E5968),
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Identity and authorization are backed by the shared system.',
                                style: AuratioTypography.caption.copyWith(
                                  color: const Color(0xFF6B788A),
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Selected Auratio Paths Card (y=348, w=350, h=120)
                      SizedBox(
                        key: selectedPathsCardKey,
                        width: double.infinity,
                        height: 120,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
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
                                'Selected Auratio paths',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              if (isThreePaths) ...[
                                Text(
                                  'Public Speaking',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: const Color(0xFF111827),
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Professional Presenting',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: const Color(0xFF111827),
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                GestureDetector(
                                  key: managePathsLinkKey,
                                  onTap: () {
                                    context.push(
                                      AppRoutePaths.managePathsContentAdded,
                                    );
                                  },
                                  child: Text(
                                    'Content Creation  •  Manage Paths  →',
                                    style: AuratioTypography.caption.copyWith(
                                      color: const Color(0xFF6B788A),
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ),
                              ] else ...[
                                for (
                                  var i = 0;
                                  i < orderedPaths.length;
                                  i++
                                ) ...[
                                  if (i > 0) const SizedBox(height: 6),
                                  Text(
                                    orderedPaths[i].label,
                                    style: AuratioTypography.bodySmall.copyWith(
                                      color: const Color(0xFF111827),
                                      fontSize: 12,
                                      height: 18 / 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 4),
                                GestureDetector(
                                  key: managePathsLinkKey,
                                  onTap: () {
                                    context.push(AppRoutePaths.managePaths);
                                  },
                                  child: Text(
                                    'Manage Paths  →',
                                    style: AuratioTypography.caption.copyWith(
                                      color: const Color(0xFF6B788A),
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Your Auratio Activity Card (y=486, w=350, h=156)
                      SizedBox(
                        key: activityCardKey,
                        width: double.infinity,
                        height: 156,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
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
                                'Your Auratio activity',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: const Color(0xFF111827),
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              GestureDetector(
                                key: privateProgressLinkKey,
                                onTap: () =>
                                    context.push(AppRoutePaths.progress),
                                child: Text(
                                  'Private Progress  →',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.backgroundBrand,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              GestureDetector(
                                key: approvedHistoryLinkKey,
                                onTap: () => context.push(
                                  AppRoutePaths.approvedEvaluationHistory,
                                ),
                                child: Text(
                                  'Approved Evaluation History  →',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.backgroundBrand,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              GestureDetector(
                                key: leaderboardsLinkKey,
                                onTap: () =>
                                    context.push(AppRoutePaths.leaderboard),
                                child: Text(
                                  'Leaderboards  →',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.backgroundBrand,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              GestureDetector(
                                key: eventsLinkKey,
                                onTap: () => context.push(AppRoutePaths.events),
                                child: Text(
                                  'Events  →',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.backgroundBrand,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 30),

                      // Settings Button (y=672, w=350, h=48)
                      SizedBox(
                        key: settingsButtonKey,
                        width: double.infinity,
                        height: 48,
                        child: OutlinedButton(
                          onPressed: () =>
                              context.push(AppRoutePaths.profileSettings),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: AuratioColors.surfaceDefault,
                            side: const BorderSide(color: Color(0xFFC8D2E0)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: EdgeInsets.zero,
                          ),
                          child: Text(
                            'Settings',
                            style: AuratioTypography.labelLarge.copyWith(
                              color: AuratioColors.backgroundBrand,
                              fontSize: 14,
                              height: 20 / 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 50),
                    ],
                  ),
                ),
              ),
            ),
            AuratioMobileNavigationBar(
              key: bottomNavKey,
              destinations: canonicalMobileDestinations,
              currentIndex: 3,
              interactiveIndices: const {1, 2},
              onDestinationSelected: (index) {
                if (index == 1) {
                  context.go(AppRoutePaths.tracks);
                } else if (index == 2) {
                  context.go(AppRoutePaths.progress);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
