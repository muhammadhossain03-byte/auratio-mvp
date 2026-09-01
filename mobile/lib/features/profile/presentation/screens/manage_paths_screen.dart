import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class ManagePathsScreen extends StatelessWidget {
  const ManagePathsScreen({
    this.isContentAdded = false,
    super.key,
  });

  final bool isContentAdded;

  static const screenKey = ValueKey('manage-paths-screen');
  static const publicSpeakingCardKey =
      ValueKey('manage-paths-public-speaking-card');
  static const professionalPresentingCardKey =
      ValueKey('manage-paths-professional-presenting-card');
  static const contentCreationCardKey =
      ValueKey('manage-paths-content-creation-card');
  static const contentCreationTitleKey =
      ValueKey('manage-paths-content-creation-title');
  static const infoCardKey = ValueKey('manage-paths-info-card');
  static const saveChangesButtonKey =
      ValueKey('manage-paths-save-changes-button');

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
              title: 'Manage Paths',
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
                      const SizedBox(height: 26),

                      // Intro (y=118, w=350)
                      Text(
                        'Personalize Auratio by adding or removing Paths.',
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: const Color(0xFF4E5968),
                          fontSize: 14,
                          height: 20 / 14,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 28),

                      // Public Speaking Card (y=166, w=350, h=104) — Selected, presentation only
                      _buildPathOptionCard(
                        key: publicSpeakingCardKey,
                        title: 'Public Speaking',
                        subtitle: 'Five speaking formats',
                        isSelected: true,
                        onTitleTap: null,
                      ),

                      const SizedBox(height: 24),

                      // Professional Presenting Card (y=294, w=350, h=104) — Selected, presentation only
                      _buildPathOptionCard(
                        key: professionalPresentingCardKey,
                        title: 'Professional Presenting',
                        subtitle: 'Five professional presentation modes',
                        isSelected: true,
                        onTitleTap: null,
                      ),

                      const SizedBox(height: 24),

                      // Content Creation Card (y=422, w=350, h=104) — Interactive on title only
                      _buildPathOptionCard(
                        key: contentCreationCardKey,
                        titleKey: contentCreationTitleKey,
                        title: 'Content Creation',
                        subtitle: 'Three speaker-led content niches',
                        isSelected: isContentAdded,
                        onTitleTap: () {
                          if (isContentAdded) {
                            context.push(AppRoutePaths.managePaths);
                          } else {
                            context.push(AppRoutePaths.managePathsContentAdded);
                          }
                        },
                      ),

                      const SizedBox(height: 44),

                      // Paths Information Card (y=570, w=350, h=88)
                      SizedBox(
                        key: infoCardKey,
                        width: double.infinity,
                        height: 88,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF6F8FB),
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
                                'Paths personalize Home and event relevance.',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'All tracks stay available. Past results, mastery, reports and leaderboard history stay unchanged.',
                                style: AuratioTypography.caption.copyWith(
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

                      const SizedBox(height: 92),

                      // Save Changes CTA (y=750, w=350, h=48)
                      SizedBox(
                        key: saveChangesButtonKey,
                        width: double.infinity,
                        height: 48,
                        child: AuratioButton(
                          label: 'Save Changes',
                          variant: AuratioButtonVariant.primary,
                          size: AuratioButtonSize.medium,
                          onPressed: () {
                            if (isContentAdded) {
                              context.go(AppRoutePaths.profileThreePaths);
                            } else {
                              context.go(AppRoutePaths.profile);
                            }
                          },
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

  Widget _buildPathOptionCard({
    required Key key,
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback? onTitleTap,
    Key? titleKey,
  }) {
    final titleText = Text(
      title,
      style: AuratioTypography.titleMedium.copyWith(
        color: const Color(0xFF111827),
        fontSize: 16,
        height: 23 / 16,
        fontWeight: FontWeight.w600,
      ),
    );

    final titleWidget = onTitleTap != null
        ? GestureDetector(
            key: titleKey,
            behavior: HitTestBehavior.opaque,
            onTap: onTitleTap,
            child: titleText,
          )
        : (titleKey != null
            ? KeyedSubtree(key: titleKey, child: titleText)
            : titleText);

    return Container(
      key: key,
      width: double.infinity,
      height: 104,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color:
            isSelected ? const Color(0xFFF3F8FE) : AuratioColors.surfaceDefault,
        border: Border.all(
          color: AuratioColors.borderDefault,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Checkbox (24 x 24) — presentation only
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: isSelected
                  ? AuratioColors.backgroundBrand
                  : AuratioColors.surfaceDefault,
              border: Border.all(
                color: isSelected
                    ? AuratioColors.backgroundBrand
                    : const Color(0xFFC8D2E0),
              ),
              borderRadius: BorderRadius.circular(6),
            ),
            alignment: Alignment.center,
            child: isSelected
                ? const Text(
                    '✓',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      height: 18 / 14,
                      fontWeight: FontWeight.w700,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 18),

          // Title & Subtitle (x=78)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                titleWidget,
                const SizedBox(height: 6),
                Text(
                  subtitle,
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
        ],
      ),
    );
  }
}
