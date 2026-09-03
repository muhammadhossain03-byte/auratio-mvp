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

  bool selectBySlug(String slug) {
    final track = AuratioTrackCatalog.findBySlug(slug);
    if (track != null) {
      state = track;
      return true;
    }
    return false;
  }

  void reset() {
    state = AuratioTrackCatalog.businessPitch;
  }
}
