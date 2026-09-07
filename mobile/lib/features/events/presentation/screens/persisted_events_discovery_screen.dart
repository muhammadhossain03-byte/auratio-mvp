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

class PersistedEventsDiscoveryScreen extends ConsumerStatefulWidget {
  const PersistedEventsDiscoveryScreen({super.key});

  static const screenKey = Key('persisted-events-discovery-screen');

  static const divisions = [
    'Dhaka Division',
    'Chattogram Division',
    'Rajshahi Division',
    'Khulna Division',
    'Barishal Division',
    'Sylhet Division',
    'Rangpur Division',
    'Mymensingh Division',
  ];

  @override
  ConsumerState<PersistedEventsDiscoveryScreen> createState() =>
      _PersistedEventsDiscoveryScreenState();
}

class _PersistedEventsDiscoveryScreenState
    extends ConsumerState<PersistedEventsDiscoveryScreen> {
  String? _division;
  AuratioPath? _path;
  bool _upcomingOnly = true;

  PersistedEventsQuery get _query =>
      (division: _division, path: _path, upcomingOnly: _upcomingOnly);

  @override
  Widget build(BuildContext context) {
    final events = ref.watch(persistedEventsProvider(_query));

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: PersistedEventsDiscoveryScreen.screenKey,
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
                title: 'Events',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.home),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bangladesh events',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Published events are read from Auratio’s persisted directory. Refine them by Division, Path, and Date.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AuratioColors.surfaceBrandSoft,
                          border: Border.all(
                            color: AuratioColors.borderDefault,
                          ),
                          borderRadius: BorderRadius.circular(AuratioRadii.lg),
                        ),
                        child: Column(
                          children: [
                            DropdownButtonFormField<String>(
                              initialValue: _division ?? '__all__',
                              isExpanded: true,
                              decoration: const InputDecoration(
                                labelText: 'Division',
                                border: OutlineInputBorder(),
                              ),
                              items: [
                                const DropdownMenuItem<String>(
                                  value: '__all__',
                                  child: Text('All Divisions'),
                                ),
                                for (final division
                                    in PersistedEventsDiscoveryScreen.divisions)
                                  DropdownMenuItem<String>(
                                    value: division,
                                    child: Text(division),
                                  ),
                              ],
                              onChanged: (value) {
                                if (value == null) return;
                                setState(() {
                                  _division = value == '__all__' ? null : value;
                                });
                              },
                            ),
                            const SizedBox(height: 12),
                            DropdownButtonFormField<String>(
                              initialValue: _path?.wireValue ?? '__all__',
                              isExpanded: true,
                              decoration: const InputDecoration(
                                labelText: 'Path',
                                border: OutlineInputBorder(),
                              ),
                              items: [
                                const DropdownMenuItem<String>(
                                  value: '__all__',
                                  child: Text('All Paths'),
                                ),
                                for (final path in AuratioPath.values)
                                  DropdownMenuItem<String>(
                                    value: path.wireValue,
                                    child: Text(path.label),
                                  ),
                              ],
                              onChanged: (value) {
                                if (value == null) return;
                                setState(() {
                                  _path = value == '__all__'
                                      ? null
                                      : AuratioPath.fromWire(value);
                                });
                              },
                            ),
                            const SizedBox(height: 8),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Upcoming only'),
                              subtitle: const Text(
                                'Turn off to include all published event dates.',
                              ),
                              value: _upcomingOnly,
                              onChanged: (value) {
                                setState(() {
                                  _upcomingOnly = value;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 22),
                      events.when(
                        loading: () => const Padding(
                          padding: EdgeInsets.all(40),
                          child: Center(child: CircularProgressIndicator()),
                        ),
                        error: (_, _) => _errorState(),
                        data: (items) => _eventList(items),
                      ),
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

  Widget _eventList(List<PersistedEvent> events) {
    if (events.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AuratioColors.surfaceDefault,
          border: Border.all(color: AuratioColors.borderDefault),
          borderRadius: BorderRadius.circular(AuratioRadii.lg),
        ),
        child: Text(
          'No published Bangladesh events match these filters.',
          style: AuratioTypography.bodyMedium.copyWith(
            color: AuratioColors.textSecondary,
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${events.length} event${events.length == 1 ? '' : 's'}',
          style: AuratioTypography.labelLarge.copyWith(
            color: AuratioColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 10),
        for (final event in events)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _eventCard(event),
          ),
      ],
    );
  }

  Widget _eventCard(PersistedEvent event) {
    return InkWell(
      borderRadius: BorderRadius.circular(AuratioRadii.lg),
      onTap: () =>
          context.push(AppRoutePaths.persistedEventDetailsFor(event.id)),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: AuratioColors.surfaceDefault,
          border: Border.all(color: AuratioColors.borderDefault),
          borderRadius: BorderRadius.circular(AuratioRadii.lg),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              event.title,
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              _location(event),
              style: AuratioTypography.bodySmall.copyWith(
                color: AuratioColors.textSecondary,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              _formatDateTime(event.startsAt),
              style: AuratioTypography.bodySmall.copyWith(
                color: AuratioColors.backgroundBrand,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (event.organizer?.trim().isNotEmpty ?? false) ...[
              const SizedBox(height: 5),
              Text(
                'Organizer: ${event.organizer}',
                style: AuratioTypography.caption.copyWith(
                  color: AuratioColors.textSecondary,
                ),
              ),
            ],
            const SizedBox(height: 9),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [for (final pathId in event.pathIds) _pathChip(pathId)],
            ),
          ],
        ),
      ),
    );
  }

  Widget _errorState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
      ),
      child: Column(
        children: [
          Text(
            'Events unavailable',
            style: AuratioTypography.labelLarge.copyWith(
              color: AuratioColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Auratio could not load the persisted event directory.',
            textAlign: TextAlign.center,
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
          const SizedBox(height: 14),
          AuratioButton(
            label: 'Try Again',
            variant: AuratioButtonVariant.secondary,
            onPressed: () => ref.invalidate(persistedEventsProvider(_query)),
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
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

  static String _location(PersistedEvent event) {
    final parts = <String>[
      if (event.venue?.trim().isNotEmpty ?? false) event.venue!.trim(),
      if (event.city?.trim().isNotEmpty ?? false) event.city!.trim(),
      event.division,
    ];
    return parts.join(' · ');
  }

  static String _formatDateTime(DateTime value) {
    final local = value.toLocal();
    final hour = local.hour % 12 == 0 ? 12 : local.hour % 12;
    final minute = local.minute.toString().padLeft(2, '0');
    final suffix = local.hour >= 12 ? 'PM' : 'AM';
    return '${local.day}/${local.month}/${local.year} · $hour:$minute $suffix';
  }
}
