import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

abstract interface class AuratioReportFileSaver {
  Future<Uri?> saveDocx({required String filename, required Uint8List bytes});
}

class FilePickerAuratioReportFileSaver implements AuratioReportFileSaver {
  const FilePickerAuratioReportFileSaver();

  static const _docxMimeType =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  @override
  Future<Uri?> saveDocx({required String filename, required Uint8List bytes}) {
    return FilePicker.saveFile(
      dialogTitle: 'Save Auratio evaluation report',
      fileName: filename,
      bytes: bytes,
      mimeType: _docxMimeType,
    );
  }
}

final auratioReportFileSaverProvider = Provider<AuratioReportFileSaver>((ref) {
  return const FilePickerAuratioReportFileSaver();
});
