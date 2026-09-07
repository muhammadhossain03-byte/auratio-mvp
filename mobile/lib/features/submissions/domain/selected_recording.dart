import 'dart:typed_data';

class SelectedRecording {
  const SelectedRecording({
    required this.name,
    required this.sizeBytes,
    required this.durationSeconds,
    required this.trackBackendId,
    this.bytes,
    this.objectPath,
  });

  final String name;
  final int sizeBytes;
  final double durationSeconds;
  final String trackBackendId;
  final Uint8List? bytes;
  final String? objectPath;

  bool get isUploaded => objectPath != null && objectPath!.isNotEmpty;

  String get formattedDuration {
    final totalSeconds = durationSeconds.round();
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  String get formattedSize {
    const kilobyte = 1024;
    const megabyte = 1024 * 1024;
    if (sizeBytes >= megabyte) {
      return '${(sizeBytes / megabyte).toStringAsFixed(1)} MB';
    }
    if (sizeBytes >= kilobyte) {
      return '${(sizeBytes / kilobyte).toStringAsFixed(1)} KB';
    }
    return '$sizeBytes B';
  }

  SelectedRecording withUploadedObjectPath(String value) {
    return SelectedRecording(
      name: name,
      sizeBytes: sizeBytes,
      durationSeconds: durationSeconds,
      trackBackendId: trackBackendId,
      objectPath: value,
    );
  }
}
