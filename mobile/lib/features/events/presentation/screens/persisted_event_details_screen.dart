import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../onboarding/domain/auratio_path.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/events_data_provider.dart';
import '../../domain/persisted_event.dart';

class PersistedEventDetailsScreen extends ConsumerWidget {
  const PersistedEventDetailsScreen({required this.eventId, super.key});

  final String eventId;

  static const screenKey = Key('persisted-event-details-screen');

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final event = ref.watch(persistedEventProvider(eventId));

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: screenKey,
      value: const SystemUiOverlayStyle(
        statusBarColor: AuratioColors.backgroundBrand,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: AuratioColors.backgroundApp,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
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
                child: event.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (_, _) => _state(
                    heading: 'Event unavailable',
                    message: 'Auratio could not load this persisted published event.',
                    retry: () =>
                        ref.invalidate(persistedEventProvider(eventId)),
                  ),
                  data: (item) {
                    if (item == null) {
                      return _state(
                        heading: 'Event not found',
                        message:
                            'This event is not currently published in Auratio.',
                      );
                    }
                    return _content(context, item);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _content(BuildContext context, PersistedEvent event) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AuratioColors.surfaceBrandSoft,
              borderRadius: BorderRadius.circular(AuratioRadii.pill),
            ),
            child: Text(
              'Published · Bangladesh',
              style: AuratioTypography.caption.copyWith(
                color: AuratioColors.backgroundBrand,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            event.title,
            style: AuratioTypography.headingMedium.copyWith(
              color: AuratioColors.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (event.organizer?.trim().isNotEmpty ?? false) ...[
            const SizedBox(height: 7),
            Text(
              'By ${event.organizer}',
              style: AuratioTypography.bodyMedium.copyWith(
                color: AuratioColors.textSecondary,
              ),
            ),
          ],
          const SizedBox(height: 20),
          _infoCard(
            children: [
              _row('Starts', _formatDateTime(event.startsAt)),
              if (event.endsAt != null)
                _row('Ends', _formatDateTime(event.endsAt!)),
              _row('Division', event.division),
              if (event.city?.trim().isNotEmpty ?? false)
                _row('City', event.city!),
              if (event.venue?.trim().isNotEmpty ?? false)
                _row('Venue', event.venue!),
            ],
          ),
          const SizedBox(height: 16),
          if (event.description?.trim().isNotEmpty ?? false)
            _infoCard(
              children: [
                Text(
                  'About',
                  style: AuratioTypography.labelLarge.copyWith(
                    color: AuratioColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  event.description!,
                  style: AuratioTypography.bodyMedium.copyWith(
                    color: AuratioColors.textSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          const SizedBox(height: 16),
          _infoCard(
            children: [
              Text(
                'Relevant Paths',
                style: AuratioTypography.labelLarge.copyWith(
                  color: AuratioColors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 7,
                runSpacing: 7,
                children: [
                  for (final pathId in event.pathIds) _pathChip(pathId),
                ],
              ),
            ],
          ),
          if (event.registrationUrl?.trim().isNotEmpty ?? false) ...[
            const SizedBox(height: 16),
            _infoCard(
              children: [
                Text(
                  'Registration link',
                  style: AuratioTypography.labelLarge.copyWith(
                    color: AuratioColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                SelectableText(
                  event.registrationUrl!,
                  style: AuratioTypography.bodySmall.copyWith(
                    color: AuratioColors.backgroundBrand,
                  ),
                ),
                const SizedBox(height: 12),
                AuratioButton(
                  label: 'Copy Registration Link',
                  variant: AuratioButtonVariant.secondary,
                  onPressed: () async {
                    await Clipboard.setData(
                      ClipboardData(text: event.registrationUrl!),
                    );
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Registration link copied.'),
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  static Widget _infoCard({required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  static Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 78,
            child: Text(
              label,
              style: AuratioTypography.caption.copyWith(
                color: AuratioColors.textTertiary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AuratioTypography.bodySmall.copyWith(
                color: AuratioColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _pathChip(String pathId) {
    String label;
    try {
      label = AuratioPath.fromWire(pathId).label;
    } on FormatException {
      label = pathId;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceBrandSoft,
        borderRadius: BorderRadius.circular(AuratioRadii.pill),
      ),
      child: Text(
        label,
        style: AuratioTypography.caption.copyWith(
          color: AuratioColors.backgroundBrand,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static Widget _state({
    required String heading,
    required String message,
    VoidCallback? retry,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              heading,
              style: AuratioTypography.headingMedium.copyWith(
                color: AuratioColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AuratioTypography.bodyMedium.copyWith(
                color: AuratioColors.textSecondary,
              ),
            ),
            if (retry != null) ...[
              const SizedBox(height: 18),
              AuratioButton(
                label: 'Try Again',
                variant: AuratioButtonVariant.secondary,
                onPressed: retry,
              ),
            ],
          ],
        ),
      ),
    );
  }

  static String _formatDateTime(DateTime value) {
    final local = value.toLocal();
    final hour = local.hour % 12 == 0 ? 12 : local.hour % 12;
    final minute = local.minute.toString().padLeft(2, '0');
    final suffix = local.hour >= 12 ? 'PM' : 'AM';
    return '${local.day}/${local.month}/${local.year} · $hour:$minute $suffix';
  }
}
