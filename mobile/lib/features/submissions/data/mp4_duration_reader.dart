import 'dart:typed_data';

abstract final class Mp4DurationReader {
  static double readDurationSeconds(Uint8List bytes) {
    if (bytes.lengthInBytes < 16) {
      throw const FormatException('The selected file is not a usable MP4.');
    }

    final data = ByteData.sublistView(bytes);
    var offset = 0;
    var hasFtyp = false;
    _Box? moov;

    while (offset + 8 <= bytes.lengthInBytes) {
      final box = _readBox(data, offset, bytes.lengthInBytes);
      if (box.type == 'ftyp') {
        hasFtyp = true;
      } else if (box.type == 'moov') {
        moov = box;
      }
      if (box.end <= offset) {
        throw const FormatException('The MP4 box layout is invalid.');
      }
      offset = box.end;
    }

    if (!hasFtyp || moov == null) {
      throw const FormatException('The selected file is not a usable MP4.');
    }

    var childOffset = moov.payloadStart;
    while (childOffset + 8 <= moov.end) {
      final child = _readBox(data, childOffset, moov.end);
      if (child.type == 'mvhd') {
        return _readMovieHeaderDuration(data, child);
      }
      if (child.end <= childOffset) {
        throw const FormatException('The MP4 movie box layout is invalid.');
      }
      childOffset = child.end;
    }

    throw const FormatException('The MP4 movie header is missing.');
  }

  static double _readMovieHeaderDuration(ByteData data, _Box box) {
    final payload = box.payloadStart;
    if (payload + 4 > box.end) {
      throw const FormatException('The MP4 movie header is incomplete.');
    }

    final version = data.getUint8(payload);
    late final int timescale;
    late final int duration;

    if (version == 0) {
      if (payload + 20 > box.end) {
        throw const FormatException(
          'The MP4 version-0 movie header is incomplete.',
        );
      }
      timescale = data.getUint32(payload + 12, Endian.big);
      duration = data.getUint32(payload + 16, Endian.big);
    } else if (version == 1) {
      if (payload + 32 > box.end) {
        throw const FormatException(
          'The MP4 version-1 movie header is incomplete.',
        );
      }
      timescale = data.getUint32(payload + 20, Endian.big);
      duration = data.getUint64(payload + 24, Endian.big);
    } else {
      throw FormatException('Unsupported MP4 movie-header version: $version');
    }

    if (timescale <= 0 || duration <= 0) {
      throw const FormatException('The MP4 duration metadata is invalid.');
    }

    final seconds = duration / timescale;
    if (!seconds.isFinite || seconds <= 0) {
      throw const FormatException('The MP4 duration metadata is invalid.');
    }
    return seconds;
  }

  static _Box _readBox(ByteData data, int offset, int limit) {
    if (offset < 0 || offset + 8 > limit) {
      throw const FormatException('The MP4 box header is incomplete.');
    }

    final size32 = data.getUint32(offset, Endian.big);
    final type = String.fromCharCodes([
      data.getUint8(offset + 4),
      data.getUint8(offset + 5),
      data.getUint8(offset + 6),
      data.getUint8(offset + 7),
    ]);

    var headerSize = 8;
    late final int boxSize;

    if (size32 == 1) {
      if (offset + 16 > limit) {
        throw const FormatException(
          'The extended MP4 box header is incomplete.',
        );
      }
      final extended = data.getUint64(offset + 8, Endian.big);
      boxSize = extended;
      headerSize = 16;
    } else if (size32 == 0) {
      boxSize = limit - offset;
    } else {
      boxSize = size32;
    }

    if (boxSize < headerSize) {
      throw const FormatException('The MP4 box size is invalid.');
    }

    final end = offset + boxSize;
    if (end > limit) {
      throw const FormatException('The MP4 box exceeds its parent boundary.');
    }

    return _Box(type: type, payloadStart: offset + headerSize, end: end);
  }
}

class _Box {
  const _Box({
    required this.type,
    required this.payloadStart,
    required this.end,
  });

  final String type;
  final int payloadStart;
  final int end;
}
