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
                  vertical: AuratioSpacing.lg,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Filter Chips Row
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          AuratioChipTab(
                            label: 'All',
                            selected: true,
                            onPressed: () {},
                          ),
                          const SizedBox(width: 6),
                          AuratioChipTab(
                            label: 'Public Speaking',
                            selected: false,
                            onPressed: () {},
                          ),
                          const SizedBox(width: 6),
                          AuratioChipTab(
                            label: 'Presenting',
                            selected: false,
                            onPressed: () {},
                          ),
                          const SizedBox(width: 6),
                          AuratioChipTab(
                            label: 'Content',
                            selected: false,
                            onPressed: () {},
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 22),

                    // Category 1: Public Speaking
                    _buildCategorySection(
                      context,
                      header: 'PUBLIC SPEAKING',
                      tracks: AuratioTrackCatalog.publicSpeakingTracks,
                    ),

                    const SizedBox(height: 22),

                    // Category 2: Professional Presenting
                    _buildCategorySection(
                      context,
                      header: 'PROFESSIONAL PRESENTING',
                      tracks: AuratioTrackCatalog.professionalPresentingTracks,
                    ),

                    const SizedBox(height: 22),

                    // Category 3: Content Creation
                    _buildCategorySection(
                      context,
                      header: 'CONTENT CREATION',
                      tracks: AuratioTrackCatalog.contentCreationTracks,
                    ),

                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: AuratioMobileNavigationBar(
          destinations: canonicalMobileDestinations,
          currentIndex: 1,
          onDestinationSelected: (index) {
            if (index == 0) {
              context.go(AppRoutePaths.home);
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
        for (final track in tracks) ...[
          _TrackRow(
            key: track.hasDetailsRoute ? businessPitchTrackKey : null,
            track: track,
            onTap: track.hasDetailsRoute
                ? () => context.go(AppRoutePaths.trackDetails)
                : null,
          ),
          const SizedBox(height: 6),
        ],
      ],
    );
  }
}

class _TrackRow extends StatelessWidget {
  const _TrackRow({required this.track, this.onTap, super.key});

  final TrackItem track;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final rowContent = Container(
      constraints: const BoxConstraints(
        minHeight: AuratioSizing.minimumTouchTarget,
      ),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
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
      return Semantics(label: track.name, child: rowContent);
    }

    return Semantics(
      button: true,
      label: '${track.name}. View track details.',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: rowContent,
        ),
      ),
    );
  }
}
