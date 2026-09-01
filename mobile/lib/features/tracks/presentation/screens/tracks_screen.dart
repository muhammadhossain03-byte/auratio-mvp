import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_navigation.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../domain/track_catalog.dart';

class TracksScreen extends StatelessWidget {
  const TracksScreen({super.key});

  static const tracksScreenKey = Key('mobile-tracks-screen');
  static const businessPitchTrackKey = Key(
    'track-row-business-pitch-sales-pitch',
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
      key: tracksScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: Column(
          children: [
            const AuratioScreenHeader(title: 'Tracks', showBack: false),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AuratioSpacing.xl,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 18),

                    // Filter Chips Row (y=110, h=32)
                    const Row(
                      children: [
                        AuratioChipTab(
                          label: 'All',
                          selected: true,
                          size: AuratioChipTabSize.compact,
                          presentationOnly: true,
                          width: 49,
                        ),
                        SizedBox(width: 6),
                        AuratioChipTab(
                          label: 'Public Speaking',
                          selected: false,
                          size: AuratioChipTabSize.compact,
                          presentationOnly: true,
                          width: 125,
                        ),
                        SizedBox(width: 6),
                        AuratioChipTab(
                          label: 'Presenting',
                          selected: false,
                          size: AuratioChipTabSize.compact,
                          presentationOnly: true,
                          width: 92,
                        ),
                        SizedBox(width: 6),
                        AuratioChipTab(
                          label: 'Content',
                          selected: false,
                          size: AuratioChipTabSize.compact,
                          presentationOnly: true,
                          width: 66,
                        ),
                      ],
                    ),

                    const SizedBox(height: 22),

                    // Category 1: Public Speaking
                    _buildCategorySection(
                      context,
                      header: 'PUBLIC SPEAKING',
                      tracks: AuratioTrackCatalog.publicSpeakingTracks,
                    ),

                    const SizedBox(height: 16),

                    // Category 2: Professional Presenting
                    _buildCategorySection(
                      context,
                      header: 'PROFESSIONAL PRESENTING',
                      tracks: AuratioTrackCatalog.professionalPresentingTracks,
                    ),

                    const SizedBox(height: 16),

                    // Category 3: Content Creation
                    _buildCategorySection(
                      context,
                      header: 'CONTENT CREATION',
                      tracks: AuratioTrackCatalog.contentCreationTracks,
                    ),

                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: AuratioMobileNavigationBar(
          destinations: canonicalMobileDestinations,
          currentIndex: 1,
          interactiveIndices: const {2, 3},
          onDestinationSelected: (index) {
            if (index == 2) {
              context.go(AppRoutePaths.progress);
            } else if (index == 3) {
              context.go(AppRoutePaths.profile);
            }
          },
        ),
      ),
    );
  }

  Widget _buildCategorySection(
    BuildContext context, {
    required String header,
    required List<TrackItem> tracks,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          header,
          style: AuratioTypography.caption.copyWith(
            color: AuratioColors.textSecondary,
            letterSpacing: 0.2,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        for (var i = 0; i < tracks.length; i++) ...[
          if (i > 0) const SizedBox(height: 6),
          _TrackRow(
            key: tracks[i].hasDetailsRoute ? businessPitchTrackKey : null,
            track: tracks[i],
            onTap: tracks[i].hasDetailsRoute
                ? () => context.go(AppRoutePaths.trackDetails)
                : null,
          ),
        ],
      ],
    );
  }
}

class _TrackRow extends StatelessWidget {
  const _TrackRow({required this.track, this.onTap, super.key});

  final TrackItem track;
  final VoidCallback? onTap;

  /// Figma-approved visible row height (width: 350, height: 34).
  static const _figmaRowHeight = 34.0;

  @override
  Widget build(BuildContext context) {
    final rowVisual = Container(
      height: _figmaRowHeight,
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      alignment: Alignment.center,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              track.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AuratioTypography.labelMedium.copyWith(
                color: AuratioColors.textPrimary,
                fontWeight: FontWeight.w500,
                fontSize: 12,
              ),
            ),
          ),
          Text(
            '›',
            style: AuratioTypography.headingMedium.copyWith(
              color: AuratioColors.textSecondary,
              fontSize: 18,
              height: 1,
            ),
          ),
        ],
      ),
    );

    if (onTap == null) {
      return Semantics(label: track.name, child: rowVisual);
    }

    // Preserve the accessible 44px hit target for the interactive row
    // without inflating the visible 34px / 40px-pitch Figma layout rhythm.
    return Semantics(
      button: true,
      label: '${track.name}. View track details.',
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          rowVisual,
          Positioned(
            top: -5,
            bottom: -5,
            left: 0,
            right: 0,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
