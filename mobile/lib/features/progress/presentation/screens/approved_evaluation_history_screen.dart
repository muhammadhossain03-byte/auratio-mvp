import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_mobile_navigation.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class ApprovedEvaluationHistoryScreen extends StatelessWidget {
  const ApprovedEvaluationHistoryScreen({super.key});

  static const screenKey = Key('approved-evaluation-history-screen');
  static const introKey = Key('approved-evaluation-history-intro');
  static const filterPillsRowKey = Key(
    'approved-evaluation-history-filter-pills-row',
  );
  static const filterAllPillKey = Key(
    'approved-evaluation-history-filter-all-pill',
  );
  static const filterAiPillKey = Key(
    'approved-evaluation-history-filter-ai-pill',
  );
  static const filterHumanPillKey = Key(
    'approved-evaluation-history-filter-human-pill',
  );
  static const aiRecordCardKey = Key(
    'approved-evaluation-history-ai-record-card',
  );
  static const humanRecordCardKey = Key(
    'approved-evaluation-history-human-record-card',
  );
  static const aiViewResultLinkKey = Key(
    'approved-evaluation-history-ai-view-result-link',
  );
  static const aiDownloadDocxLinkKey = Key(
    'approved-evaluation-history-ai-download-docx-link',
  );
  static const humanViewResultLinkKey = Key(
    'approved-evaluation-history-human-view-result-link',
  );
  static const humanDownloadDocxLinkKey = Key(
    'approved-evaluation-history-human-download-docx-link',
  );
  static const progressEffectCardKey = Key(
    'approved-evaluation-history-progress-effect-card',
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
                title: 'Approved History',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.progress),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),

                      // Intro (y=116, w=350, h=36)
                      Text(
                        'Approved results remain in your private history even after they leave a public rating window.',
                        key: introKey,
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 12,
                          height: 18 / 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Filter Pills Row (y=166, h=34)
                      Row(
                        key: filterPillsRowKey,
                        children: [
                          // All (selected)
                          Container(
                            key: filterAllPillKey,
                            width: 66,
                            height: 34,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AuratioColors.backgroundBrand,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              'All',
                              style: AuratioTypography.caption.copyWith(
                                color: AuratioColors.textOnBrand,
                                fontSize: 11,
                                height: 16 / 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),

                          // AI (unselected)
                          Container(
                            key: filterAiPillKey,
                            width: 66,
                            height: 34,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AuratioColors.surfaceDefault,
                              border: Border.all(
                                color: AuratioColors.borderStrong,
                              ),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              'AI',
                              style: AuratioTypography.caption.copyWith(
                                color: AuratioColors.backgroundBrand,
                                fontSize: 11,
                                height: 16 / 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),

                          // Human (unselected)
                          Container(
                            key: filterHumanPillKey,
                            width: 86,
                            height: 34,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AuratioColors.surfaceDefault,
                              border: Border.all(
                                color: AuratioColors.borderStrong,
                              ),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              'Human',
                              style: AuratioTypography.caption.copyWith(
                                color: AuratioColors.backgroundBrand,
                                fontSize: 11,
                                height: 16 / 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 22),

                      // Approved Record 1 — AI (y=222, w=350, h=138)
                      SizedBox(
                        key: aiRecordCardKey,
                        width: double.infinity,
                        height: 138,
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
                                'Business Pitch / Sales Pitch',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 80,
                                    height: 30,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: AuratioColors
                                          .statusApprovedBackground,
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      'Approved',
                                      style: AuratioTypography.caption.copyWith(
                                        color: AuratioColors
                                            .statusApprovedForeground,
                                        fontSize: 11,
                                        height: 16 / 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Text(
                                    'AI Evaluation',
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.neutral500,
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Text(
                                    'Score',
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.neutral500,
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '88 / 100',
                                    style: AuratioTypography.bodyMedium
                                        .copyWith(
                                          color: AuratioColors.backgroundBrand,
                                          fontSize: 13,
                                          height: 18 / 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                  ),
                                  const Spacer(),
                                  Text(
                                    'Approved 22 Aug 2026',
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.textSecondary,
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  GestureDetector(
                                    key: aiViewResultLinkKey,
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () => context.push(
                                      AppRoutePaths.evaluationResultAi,
                                    ),
                                    child: Text(
                                      'View Result',
                                      style: AuratioTypography.caption.copyWith(
                                        color: AuratioColors.backgroundBrand,
                                        fontSize: 11,
                                        height: 16 / 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  GestureDetector(
                                    key: aiDownloadDocxLinkKey,
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () => context.push(
                                      AppRoutePaths
                                          .evaluationReportDownloadSimulated,
                                    ),
                                    child: Text(
                                      'Download .docx',
                                      style: AuratioTypography.caption.copyWith(
                                        color: AuratioColors.backgroundBrand,
                                        fontSize: 11,
                                        height: 16 / 11,
                                        fontWeight: FontWeight.w600,
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

                      // Approved Record 2 — Human (y=378, w=350, h=138)
                      SizedBox(
                        key: humanRecordCardKey,
                        width: double.infinity,
                        height: 138,
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
                                'Business Pitch / Sales Pitch',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Row(
                                children: [
                                  Container(
                                    width: 80,
                                    height: 30,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: AuratioColors
                                          .statusApprovedBackground,
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      'Approved',
                                      style: AuratioTypography.caption.copyWith(
                                        color: AuratioColors
                                            .statusApprovedForeground,
                                        fontSize: 11,
                                        height: 16 / 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Text(
                                    'Human Evaluation',
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.neutral500,
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Text(
                                    'Score',
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.neutral500,
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '84 / 100',
                                    style: AuratioTypography.bodyMedium
                                        .copyWith(
                                          color: AuratioColors.backgroundBrand,
                                          fontSize: 13,
                                          height: 18 / 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                  ),
                                  const Spacer(),
                                  Text(
                                    'Approved 18 Aug 2026',
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.textSecondary,
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  GestureDetector(
                                    key: humanViewResultLinkKey,
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () => context.push(
                                      AppRoutePaths.evaluationResultHuman,
                                    ),
                                    child: Text(
                                      'View Result',
                                      style: AuratioTypography.caption.copyWith(
                                        color: AuratioColors.backgroundBrand,
                                        fontSize: 11,
                                        height: 16 / 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  GestureDetector(
                                    key: humanDownloadDocxLinkKey,
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () => context.push(
                                      AppRoutePaths
                                          .evaluationReportDownloadSimulated,
                                    ),
                                    child: Text(
                                      'Download .docx',
                                      style: AuratioTypography.caption.copyWith(
                                        color: AuratioColors.backgroundBrand,
                                        fontSize: 11,
                                        height: 16 / 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 36),

                      // Progress Effect Card (y=552, w=350, h=104)
                      SizedBox(
                        key: progressEffectCardKey,
                        width: double.infinity,
                        height: 104,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
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
                                'Progress effect',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 13,
                                  height: 18 / 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'Pending Moderation and Rejected evaluations do not update effective private progress and are not counted here as Approved records.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 16 / 12,
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
            ],
          ),
        ),
        bottomNavigationBar: AuratioMobileNavigationBar(
          destinations: canonicalMobileDestinations,
          currentIndex: 2,
          onDestinationSelected: _noOpNavigation,
        ),
      ),
    );
  }

  static void _noOpNavigation(int index) {}
}
