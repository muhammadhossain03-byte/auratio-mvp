import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';

class PickedRecordingFile {
  const PickedRecordingFile({required this.name, required this.bytes});

  final String name;
  final Uint8List bytes;

  int get sizeBytes => bytes.lengthInBytes;
}

abstract interface class AuratioRecordingPicker {
  Future<PickedRecordingFile?> pickMp4();
}

class FilePickerAuratioRecordingPicker implements AuratioRecordingPicker {
  const FilePickerAuratioRecordingPicker();

  @override
  Future<PickedRecordingFile?> pickMp4() async {
    final file = await FilePicker.pickFile(
      type: FileType.custom,
      allowedExtensions: const ['mp4'],
    );
    if (file == null) {
      return null;
    }

    final bytes = await file.readAsBytes();
    return PickedRecordingFile(name: file.name, bytes: bytes);
  }
}
