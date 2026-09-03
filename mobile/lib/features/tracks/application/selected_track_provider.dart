import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/track_catalog.dart';

final selectedTrackProvider =
    NotifierProvider<SelectedTrackController, TrackItem>(
      SelectedTrackController.new,
    );

class SelectedTrackController extends Notifier<TrackItem> {
  @override
  TrackItem build() {
    // Default to Business Pitch / Sales Pitch for deterministic fallback
    return AuratioTrackCatalog.businessPitch;
  }

  void select(TrackItem track) {
    state = track;
  }

  void selectBySlug(String slug) {
    state = AuratioTrackCatalog.findBySlug(slug);
  }

  void reset() {
    state = AuratioTrackCatalog.businessPitch;
  }
}
